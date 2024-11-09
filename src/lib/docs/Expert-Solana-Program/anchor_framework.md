# Anchor开发框架
Anchor作为一款开发框架，提供了合约开发的基本结构，区别于我们之前介绍"instruction/stat/process"
基本程序结构，同时Anchor还提供了客户端相关的Typescript相关类库，以及"anchor"命令工具。

## Anchor程序结构


一个Anchor工程主要包含了

* "declare_id"宏声明的合约地址，用于创建对象的owner
* #[derive(Accounts)] 修饰的Account对象，用于表示存储和指令
* "program" 模块，这里面写主要的合约处理逻辑

对应到我们之前的HelloWorld，就是要将state和instruction部分用 ` #[derive(Accounts)] `
修饰，将process逻辑放到program模块中，并增加一个合约地址的修饰。

``` #[program] ```
修饰的Module即为指令处理模块。其中有一个Context类型，来存放所有的指令参数。比如

* ctx.accounts 所有的请求keys，也就是AccountMeta数组
* ctx.program_id 指令中的program_id
* ctx.remaining_accounts 指令中，没有被下面说的"Accounts"修饰的成员的AccountMeta
* 

### 处理指令

对于指令，我们要通过`#[derive(Accounts)]`来修饰我们定义的指令部分的定义：

```

#[account]
#[derive(Default)]
pub struct MyAccount {
    data: u64
}


#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>
}

```

这里定义了指令结构 "SetData" ， 那么在处理里面我们就要定义相应的处理函数：

```
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<()> {
        ctx.accounts.my_account.data = data;
        Ok(())
    }
}
```
函数名固定为结构体名的小写snake风格的命名，对应"SetData"也就是"set_data"。类似process
的函数，这个函数的原型也是固定的

```
    pub fun xxx_yyy_zzz(ctx: Context<IxData>, data:Data) -> Result<()> {}
```
第一个参数为Context 其为泛型类型，类型为要处理的指令结构，后续data部分的结构定义。 返回值为一个Result。

同时我们可以给指令增加一些校验，类似我们在process里面的相关校验。

```

#[account]
#[derive(Default)]
pub struct MyAccount {
    data: u64,
    mint: Pubkey
}


#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
    #[account(
        constraint = my_account.mint == token_account.mint,
        has_one = owner
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub owner: Signer<'info>
}
```

在需要增加校验信息的account上面增加 `#[account()]` 修饰，比如这里用

* "mut"表示 "my_account"为"writeable"，
* "has_one" 表示token_account的owner为这里的owner成员
* "constraint" 指定限制条件，类似一个条件表达式，这里意思是 ```if my_account.mint == token_account.mint ```
* "init" account是否创建了
* "payer" 为这个账号创建付费的账号
* "space" 这个账号的data部分大小




### 错误处理
在我们之前的结构中，我们专门用了error.rs来枚举错误，在Anchor中提供了两类错误

* Anchor自身错误
* 自定义错误

Anchor自身错误，可以参考具体的[错误码](https://docs.rs/anchor-lang/latest/anchor_lang/error/enum.ErrorCode.html)

自定义错误通过"err!"和"error_code!"宏来抛出和定义：

```
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        if data.data >= 100 {
            return err!(MyError::DataTooLarge);
        }
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}




#[error_code]
pub enum MyError {
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```

Anchor提供了一个类似assert的 `requre!`宏，用于判断条件，并打印错误码，返回错误：

```
  require!(data.data < 100, MyError::DataTooLarge);
```

如果条件不满足，则返回后面的错误。


### 合约间调用
在前面介绍的CPI，我们主要是通过 `invoke` 和 `invoke_signed`来实现。在Anchor中，也可以
用这两个函数，同时如果两个合约都是anchor工程，anchor还提供了一个cpi模块来实现更方便的操作。

此时在主调项目中引入被调用项目的代码，并添加特性 `features = ["cpi"]`：

```
puppet = { path = "../puppet", features = ["cpi"]}
```

这样在主调用合约工程里面，anchor会自动生成 "puppet::cpi" 模块，该模块下的accounts既可以访问到
被调用合约工程的accounts定义。而"cpi"模块下，有别调用合约的 `#[program]` 修饰的模块的方法

当调用时，通过

```
被调用合约::cpi::被调用指令方法(CpiContext类型ctx, data)
```

来进行调用，比如：

```
        let cpi_program = self.puppet_program.to_account_info();
        let cpi_accounts = SetData {
            puppet: self.puppet.to_account_info()
        };
        let ctx = CpiContext::new(cpi_program, cpi_accounts)
        puppet::cpi::set_data(ctx, data)
```

在主调合约中，先通过传递过来的被调用合约地址构造"cpi_program",然后再构造需要调用的指令结构，
用这个地址和指令结构构造CpiContext。

接着使用cpi调用即可。

当进行调用完成后，我们也可以像"invoke"一样来调用"get_return_data"获取返回值，而在Anchor中，
通过上面的介绍，我们知道，可以直接在指令函数的返回结果中从Result中获得：


```
puppet:

    pub fn set_data(ctx: Context<SetData>, data: u64) -> Result<u64> {
  
puppet master:

    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    let result = puppet::cpi::set_data(cpi_ctx, data)?;

```
这里既可以获得结果值。
### PDA生成
在前面，我们介绍的PDA生成，是通过 `Pubkey::find_program_address`方法，该方法，返回一个
key和一个bump，Anchor将这个过程封装了一下，但是这里好像不是那么丝滑。

```
let pda = hash(seeds, bump, program_id);
```
需要自己来提供这个bump，为了寻找bump就得进行循环查找：

```
fn find_pda(seeds, program_id) {
  for bump in 0..256 {
    let potential_pda = hash(seeds, bump, program_id);
    if is_pubkey(potential_pda) {
      continue;
    }
    return (potential_pda, bump);
  }
  panic!("Could not find pda after 256 tries.");
}
```

或者由用户提供。但是实际上在Anchor中使用的时候，是不需要显式的去调用的，Anchor通过
在```#[account(```中添加 `seeds = [b"user-stats", user.key().as_ref()], bump = user_stats.bump)` 来指定seeds和bump。

这样结合本合约的地址，就可以推导出这个account的Pubkey了。

在合约里面通过 `ctx.bumps.get("user_stats")`既可以获得对应`#[account]` 修饰的指令成员Account的

如果bump不赋值，比如：

```
seeds = [b"user-stats", user.key().as_ref()], bump]
```
在调用`ctx.bumps.get("user_stats")`则由合约去用上面的循环来找到第一个可用的bump。


那如果需要做签名的PDA要怎么调用，也就是在CPI中如何使用PDA签名。

这个时候我们需要将

```
CpiContext::new(cpi_program, cpi_accounts) 

修改成

CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
```

这里"seeds"即为生成PDA时候的Seeds。此时调用的时候，会检查 所有的cpi_accounts
都符合：

```
hash(seeds, current_program_id) == account address
```

除非该成员Account是"UncheckedAccount"类型。


## 参考示例

Anchor官方提供了 [一些例子](https://github.com/coral-xyz/anchor/tree/master/examples/tutorial)