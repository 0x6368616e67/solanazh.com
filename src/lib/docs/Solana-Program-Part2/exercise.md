# 课后练习

扩充 Token 合约，为 Token 合约增加 Meta 信息，如

- icon: 代币图标
- name: 代币名称
- symbol: 代币符号缩写
- home: 代币主页

> 提示：
>
> - 1. 增加一个 Token 管理合约
> - 2. 当通过 Token 合约 Mint 新 SPL Token 的时候，同时在这个新合约里面注册 Token 合约地址以及对应的 Meta 信息
> - 3. 用 Mint 的 SPL Token 的地址去这个合约中去查询 Meta 信息

## 参考答案

我们实现一个合约，这个合约输入为一个 Mint 的 token 地址，然后我们在这个合约中用 SPL Token 地址这个 Mint 的地址为 seed 生成一个 PDA：

```

        let (gen_ext_mint_key, bump) = Pubkey::find_program_address(
            &[
                &spl_token_program_account.key.to_bytes(),
                &mint_account.key.to_bytes(),
            ],
            program_id,
        );
```

以这个推导出来的地址作为 Token 的 Meta 信息，然后定义其中格式为：

```
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ExtMint {
    /// number of greetings
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub icon: String,
}
```

为这个合约定义一个 mint 的 instruction：

```

/// Instructions supported by the generic Name Registry program
#[derive(Clone, Debug, BorshSerialize, BorshDeserialize, PartialEq, BorshSchema)]
pub enum ExtSplInstruction {
    Mint{
        name: String,
        symbol: String,
        icon: String,
    }
}
```

在处理里面，首先创建这个 Meta 信息的 Account，然后将这些内容序列化进去：

```
  let ext_mint = ExtMint{
            mint: *mint_account.key,
            name: name,
            symbol: symbol,
            icon: icon,
        };
        let ext_mint_data_len = ext_mint.try_to_vec().unwrap().len();


        let rent = Rent::get()?;
        let invoke_seed: &[&[_]] =  &[
            &spl_token_program_account.key.to_bytes(),
            &mint_account.key.to_bytes(),
            &[bump],
        ];
        invoke_signed(
            &system_instruction::create_account(
                auth_account.key,
                ext_mint_account.key,
                rent.minimum_balance(ext_mint_data_len).max(1),
                ext_mint_data_len as u64,
                program_id,
            ),
            &[
                auth_account.clone(),
                ext_mint_account.clone(),
                system_program_account.clone(),
            ],
            &[invoke_seed],
        )?;

        ext_mint.serialize(&mut *ext_mint_account.data.borrow_mut())?;
```

在客户端访问的时候，只需要知道是那个 Token 的 Mint 地址。就可以构造出 Meta 信息的 Account，然后请求 Account 并做解析：

```
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ExtMint {
    /// number of greetings
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub icon: String,
}

    let state = client.get_account(&ext_mint).unwrap();
    let  extmint_info= ExtMint::try_from_slice(&state.data).unwrap();
    println!("extmint_info:{:#?}", extmint_info);
```

## 参考代码

[w6-exerciese](../assets/files/w6-exerciese.zip)
