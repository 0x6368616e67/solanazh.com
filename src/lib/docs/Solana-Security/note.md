# 合约开发安全注意点

## 签名安全
我们需要对敏感的数据修改做权限校验，比如如下程序

```
   pub fn process_create(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        msg: String,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();

        let greeting_account = next_account_info(accounts_iter)?;



        // Increment and store the number of times the account has been greeted
        let mut greeting_info = GreetingInfo {
            message: "".to_string(),
        };
        greeting_info.message = msg;
        greeting_info.serialize(&mut *greeting_account.data.borrow_mut())?;

        msg!("set note to  {} !", greeting_info.message);
        Ok(())
    }


```

这里在修改 自己账号 GreetingInfo 的时候，并没有Check操作者是否有权限修改。如果这个结构里面存储的是资金，
那么在转移资金的时候，如果不确保相应的账号有签名校验，就有可能在这里被钻空子。

## Owner 检查
这个可以认为是Solana/Sui/Aptos这种将存储视为资源的链的通病。Solana里面的每个Account都有Owner属性，
只有Owner为本合约，这个合约才有权限操作这个Account。当然了，这就带来了，如果我们不检查这个Owner的话，
就有可能操作一个本不该这个合约可以操作的Account，比如读取某个状态变量。

```
#[derive(Clone)]
pub struct AccountInfo<'a> {
    /// Public key of the account
    pub key: &'a Pubkey,
    /// Was the transaction signed by this account's public key?
    pub is_signer: bool,
    /// Is the account writable?
    pub is_writable: bool,
    /// The lamports in the account.  Modifiable by programs.
    pub lamports: Rc<RefCell<&'a mut u64>>,
    /// The data held in this account.  Modifiable by programs.
    pub data: Rc<RefCell<&'a mut [u8]>>,
    /// Program that owns this account
    pub owner: &'a Pubkey,
    /// This account's data contains a loaded program (and is now read-only)
    pub executable: bool,
    /// The epoch at which this account will next owe rent
    pub rent_epoch: Epoch,
}
```

这个是SPL-Token的 Token Account。这个Account的Owner为 "SPL-Token"， 如果在我们的合约中
依赖读取某个 TokenAccount的余额信息，但是又没有做Owner检查的时候，科学家就可以按照上面的
这个Account的数据格式，构造出来一个这样的Account，然后将这个Account传递给我们的合约，从而
修改状态数据。

## PDA 错乱
PDA是我们常用的用来存储特定数据的方式，通过给定Seed，我们可以推到出需要的Account的地址。因此
这里必须设计好PDA的Seed。如果Seed的规则设计的有问题，就有可能导致不同的逻辑，可以互相操作对方
的数据。

比如我们有这样的Seed设计。为每个用户生成一个Vault Account，该Account的生成Seed规则是：

    使用者的Address+"vault"

然后再另外一个Play的逻辑里面也定义了一些PDA，比如：

    使用者的Address+"profile"
    使用者的Address+"level" 
    ...
    使用者的Address+ "vault"

这里因为不知道之前已经用了这个规则，因此在此对这个账号进行了写入操作。就会导致之前写入的关键金融信息丢失。

另外一种场景就是CPI之间调用的时候，我们是要根据 Seed生成Bump，如果Seed的规则过于简单，可以被科学家
推导出来，那么就可以进行相应的构造，从而使得这个 CPI的调用PDA签名成立，对相应的数据进行修改。

## Type Cosplay
因为Solana在操作的时候，需要客户端将相应的Account的地址都传递给合约进行操作。那么这里在传递的时候，
有时候可以被科学家构造一个相同的数据结果的Account给到合约去用。这样因为这个数据是伪造的，就有可能导致
逻辑出错问题。

比如这里我们定义了用户的Config信息：

```
pub struct UserConfig {
    x: u8,
    y: u16,
    z: u32,

}

```

在我们操作用户的动作的时候，需要传递这个信息：

```
    fn process_play(cfg: UserConfig, accounts: &[AccountInfo] ) {
        let accounts_iter = &mut accounts.iter();

        let user_account = next_account_info(accounts_iter)?;

        ...

        user.score = cfg.x*1+cfg.y*1+cfg.z*1
        ...

    }
```

这里计算用户得分的时候，需要传递一个配置文件。假设这里我们没有check这个Account的其他信息。直接
使用的话。因为这里数据结构是一样的，因此合约 是可以正常执行的。但是我们使用的配置信息就不一样了，
就给了科学家可操作的空间。

## Account Close
在前面的课程中，我们有介绍rents的作用。当Account里面的lamports低于需要的rents的时候，该Account
将会被系统回收，也就是会销毁这个Account。

在我们的合约中，有时候需要主动的关闭或者说消耗我们Account资源，就好比我们普通的程序中可能会删除某个
文件一样。比如有个玩家注销的时候，需要删除这个用户的用户数据，由PDA生成的一个Account资源。

正常的操作里面，一般是有个Instruction来处理这个事情具体的处理逻辑如下：

```
 pub fn close(ctx: Context<Close>) -> ProgramResult {
        let dest_starting_lamports = ctx.accounts.destination.lamports();

        **ctx.accounts.destination.lamports.borrow_mut() = dest_starting_lamports
            .checked_add(ctx.accounts.account_to_close.to_account_info().lamports())
            .unwrap();
        **ctx.accounts.account_to_close.to_account_info().lamports.borrow_mut() = 0;

        Ok(())
    }
```

先把目标Account的lamports设置为0，然后再将其lamports转移到需要存储的Account中。

正常情况下是没有问题的，在这个instruciton执行后，这个Account的owner会变成System，然后并不是立马被
销毁，而是在系统做GC的时候，进行销毁。
 
此时科学家有可能构造一个tx，里面在这个instruction之后，再跟一个给这个Account传入sol的动作。这样这个
Account就会成为一个脏数据，或者历史数据遗留下来。

比如我们在这个Account里面记录用户可以提取的奖励，提取一次后，就关闭了。因为这里没法关闭，就可能导致用户
可以一直提取。


## 多Bumps待选

在使用PDA的时候，我们在合约中是这样操作的

```
        let (gen_ext_mint_key, bump) = Pubkey::find_program_address(
            &[
                &spl_token_program_account.key.to_bytes(),
                &mint_account.key.to_bytes(),
            ],
            program_id,
        );
```

这里"find_program_address"是从[0-255]找到第一个可以用的bump跟seed凑成可以推到出这里的PDA
地址。但是[0-255]并不是只有一个值可以用。

所以我们需要做好这个bump的校验。

假设我们在这里没有校验bump,科学家在传入的account里面，用另外一个bump构造了这样的一个Account，
那么合约也是可以正常执行的，但是这个时候操作的数据却是另外一个账号，假设我们将是否可以提前某个奖励
的信息存放在这个Account中。当判断是否提前的时候，科学家就用这个 bump2 的Account，提取的时候，
就用正确的bump，这样就又构造了一个无限提取的条件。