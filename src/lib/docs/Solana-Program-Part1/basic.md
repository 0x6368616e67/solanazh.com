# Solana合约结构

回到我们之前在Playground,这次我们直接用其给的模版创建项目。

里面看到合约代码：

    use borsh::{BorshDeserialize, BorshSerialize};
    use solana_program::{
        account_info::{next_account_info, AccountInfo},
        entrypoint,
        entrypoint::ProgramResult,
        msg,
        program_error::ProgramError,
        pubkey::Pubkey,
    };

    /// Define the type of state stored in accounts
    #[derive(BorshSerialize, BorshDeserialize, Debug)]
    pub struct GreetingAccount {
        /// number of greetings
        pub counter: u32,
    }

    // Declare and export the program's entrypoint
    entrypoint!(process_instruction);

    // Program entrypoint's implementation
    pub fn process_instruction(
        program_id: &Pubkey, // Public key of the account the hello world program was loaded into
        accounts: &[AccountInfo], // The account to say hello to
        _instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
    ) -> ProgramResult {
        msg!("Hello World Rust program entrypoint");

        // Iterating accounts is safer than indexing
        let accounts_iter = &mut accounts.iter();

        // Get the account to say hello to
        let account = next_account_info(accounts_iter)?;

        // The account must be owned by the program in order to modify its data
        if account.owner != program_id {
            msg!("Greeted account does not have the correct program id");
            return Err(ProgramError::IncorrectProgramId);
        }

        // Increment and store the number of times the account has been greeted
        let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
        greeting_account.counter += 1;
        greeting_account.serialize(&mut *account.data.borrow_mut())?;

        msg!("Greeted {} time(s)!", greeting_account.counter);

        Ok(())
    }


合约的整体结构是：

    use xxx;

    entrypoint!(process_instruction); 

    pub fn process_instruction(
        program_id: &Pubkey, 
        accounts: &[AccountInfo],
        instruction_data: &[u8], 
    ) -> ProgramResult {
        ...
        Ok(())
    }

最前面的 `use` 是rust的基本语法,导入相关定义。

这里通过 `entrypoint` 宏声明了一个函数"process_instruction"为整个合约的入口函数。
在前面的调用我们知道，调用的基本单元是instruction,其定义为：

    /**
    * Transaction Instruction class
    */
    export class TransactionInstruction {
        /**
        * Public keys to include in this transaction
        * Boolean represents whether this pubkey needs to sign the transaction
        */
        keys: Array<AccountMeta>;
        /**
        * Program Id to execute
        */
        programId: PublicKey;
        /**
        * Program input
        */
        data: Buffer;
        constructor(opts: TransactionInstructionCtorFields);
    }

这里的 `programId` 指定了和哪个合约交互。而具体执行这个合约的哪个方法呢？就是这里的 `entrypoint`
来指定的。其原型必须为：


    pub fn process_instruction(
        program_id: &Pubkey, 
        accounts: &[AccountInfo],
        instruction_data: &[u8], 
    ) -> ProgramResult {
        ...
        Ok(())
    }

`program_id`对应了调用Instruction里面的 `programId`, `accounts`则对应调用里面的 `keys`。
`instruction_data`则为调用指令里面的 `data`。这样solana在处理的时候，就可以将调用与
合约逻辑一一对上了。

因为函数返回的是一个Result:

    use {
        std::{
            result::Result as ResultGeneric,
        },
    };

    pub type ProgramResult = ResultGeneric<(), ProgramError>;


所以最后返回结果，成功的时候返回 `Ok(())`.如果错误，需要返回"solana::program_error::ProgramError"


## 获取Account对象
客户端通过RPC调用传递过来的Account对象，在合约里面要怎么去获取呢？

        // Iterating accounts is safer than indexing
        let accounts_iter = &mut accounts.iter();

        // Get the account to say hello to
        let account = next_account_info(accounts_iter)?;


因为这里，`accounts` 是一个 `&[AccountInfo]` AccountInfo的数组，因此我们可以通过
`iter()`来得到其迭代器，并通过 `solana_program::account_info::next_account_info` 解析出
`solana_program::AccountInfo`对象。


    pub fn next_account_info<'a, 'b, I: Iterator<Item = &'a AccountInfo<'b>>>(
        iter: &mut I,
    ) -> Result<I::Item, ProgramError> {
        iter.next().ok_or(ProgramError::NotEnoughAccountKeys)
    }


    pub struct AccountInfo<'a> {
        /// Public key of the account
        pub key: &'a Pubkey,
        /// The lamports in the account.  Modifiable by programs.
        pub lamports: Rc<RefCell<&'a mut u64>>,
        /// The data held in this account.  Modifiable by programs.
        pub data: Rc<RefCell<&'a mut [u8]>>,
        /// Program that owns this account
        pub owner: &'a Pubkey,
        /// The epoch at which this account will next owe rent
        pub rent_epoch: Epoch,
        /// Was the transaction signed by this account's public key?
        pub is_signer: bool,
        /// Is the account writable?
        pub is_writable: bool,
        /// This account's data contains a loaded program (and is now read-only)
        pub executable: bool,
    }

这样就可以得到传递过来的最原始的Account对象了。

比如这里我们传递了一个owner为这个合约的account对象，并在其data部分存储了：

    pub struct GreetingAccount {
        /// number of greetings
        pub counter: u32,
    }

这个结构体的数据，作为计数器来使用。

所以在获得该对象后，可以进行Account信息的相关检查：

    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

如果Account里面的owner不是我们的合约，直接返回出错。并且指定了错误码。

## Account数据存储

上面我们读取了传递的存储单元Account的基础信息，那么具体存储的值是如何操作的呢？

     let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;

这里因为我们在定义GreetingAccount的使用了

    #[derive(BorshSerialize, BorshDeserialize, Debug)]
    pub struct GreetingAccount {    

Borsh的默认实现，所以可以直接通过`try_from_slice`方法，将Account中的data借用出来做解析。

[Borsh](https://borsh.io/) 是一个序列化标准，其有多个语言的实现，比如我们这里的Rust和客户端可以用
的Javascript。具体逻辑类似我们在前端web3.js访问时候的buffer的定义。我们可以忽略其具体实现，直接进行使用。

当然这里我们还可以使用其他序列化工具，比如Anchor。

反序列化这里的data部分后，就可以得到 `GreetingAccount`对象了。


    greeting_account.counter += 1;
    greeting_account.serialize(&mut *account.data.borrow_mut())?;

这里先修改 `GreetingAccount`对象，然后再将其序列化回Account的data部分中。实际就是将 "greeting_account" 序列化成二进制数据，然后再填入account.data部分的。

因为我们在前端传递的时候，给这个Account的isWritable是true，所以我们合约中修改了Account.data
部分在合约执行结束时，就会修改链上的相关数据。



## 客户端访问

这里贴上课上客户端访问代码：

```
// No imports needed: web3, borsh, pg and more are globally available

/**
 * The state of a greeting account managed by the hello world program
 */
class GreetingAccount {
  counter = 0;
  constructor(fields: { counter: number } | undefined = undefined) {
    if (fields) {
      this.counter = fields.counter;
    }
  }
}

/**
 * Borsh schema definition for greeting accounts
 */
const GreetingSchema = new Map([
  [GreetingAccount, { kind: "struct", fields: [["counter", "u32"]] }],
]);

/**
 * The expected size of each greeting account.
 */
const GREETING_SIZE = borsh.serialize(
  GreetingSchema,
  new GreetingAccount()
).length;

// Create greetings account instruction
const greetingAccountKp = new web3.Keypair();
const lamports = await pg.connection.getMinimumBalanceForRentExemption(
  GREETING_SIZE
);
const createGreetingAccountIx = web3.SystemProgram.createAccount({
  fromPubkey: pg.wallet.publicKey,
  lamports,
  newAccountPubkey: greetingAccountKp.publicKey,
  programId: pg.PROGRAM_ID,
  space: GREETING_SIZE,
});

// Create greet instruction
const greetIx = new web3.TransactionInstruction({
  keys: [
    {
      pubkey: greetingAccountKp.publicKey,
      isSigner: false,
      isWritable: true,
    },
  ],
  programId: pg.PROGRAM_ID,
});

// Create transaction and add the instructions
const tx = new web3.Transaction();
tx.add(createGreetingAccountIx, greetIx);

// Send and confirm the transaction
const txHash = await web3.sendAndConfirmTransaction(pg.connection, tx, [
  pg.wallet.keypair,
  greetingAccountKp,
]);
console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

// Fetch the greetings account
const greetingAccount = await pg.connection.getAccountInfo(
  greetingAccountKp.publicKey
);

// Deserialize the account data
const deserializedAccountData = borsh.deserialize(
  GreetingSchema,
  GreetingAccount,
  greetingAccount.data
);

console.log(
  `deserializedAccountData.counter :${deserializedAccountData.counter}`
);

```