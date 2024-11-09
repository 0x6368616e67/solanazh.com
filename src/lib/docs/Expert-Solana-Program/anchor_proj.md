# Anchor实践

我们将之前的我们的记事本合约改成Anchor工程。同时为了模拟PDA，我们将记事本所在地，按照用户
改成其PDA地址。

首先创建工程：

```
anchor init note
```


## 设计指令
定义指令Account:

```
#[derive(Accounts)]
pub struct Create<'info> {
    #[account(
        init,
        payer=user,
        space = 128,
        seeds = [user.key().as_ref()],
        bump
    )]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

其中State定义为：

```
#[account]
pub struct Note {
    pub message: String
}

```

存储消息。

这里 
```
    #[account(
        init,
        payer=user,
        space = 128,
        seeds = [user.key().as_ref()],
        bump
    )]
```
会新创建一个Account，该account的地址为 seeds确定的PDA地址，空间大小为128字节，由user来支付lamports费用。

## 执行逻辑

```
#[program]
pub mod note {
    use super::*;

    pub fn create(ctx: Context<Create>, msg: String) -> Result<()> {
        let note = &mut ctx.accounts.note;

        note.message = msg;
        Ok(())
    }
}
```

这里整个逻辑就非常简单。直接获取相应的Account对象，然后将该state对象的message赋值即可。