# Solana合约错误定义
在前面的指令处理函数中，我们需要返回`ProgramResult`类型，其定义为：

    use {
        std::{
            result::Result as ResultGeneric,
        },
    };

    pub type ProgramResult = ResultGeneric<(), ProgramError>;

其实就是一个使用了ProgramError作为Err部分的Result类型枚举。

## 系统错误

上面提到的ProgramError的定义为：

    /// Reasons the program may fail
    #[derive(Clone, Debug, Deserialize, Eq, Error, PartialEq, Serialize)]
    pub enum ProgramError {
        /// Allows on-chain programs to implement program-specific error types and see them returned
        /// by the Solana runtime. A program-specific error may be any type that is represented as
        /// or serialized to a u32 integer.
        #[error("Custom program error: {0:#x}")]
        Custom(u32),
        #[error("The arguments provided to a program instruction were invalid")]
        InvalidArgument,
        #[error("An instruction's data contents was invalid")]
        InvalidInstructionData,
        #[error("An account's data contents was invalid")]
        InvalidAccountData,
        #[error("An account's data was too small")]
        AccountDataTooSmall,
        #[error("An account's balance was too small to complete the instruction")]
        InsufficientFunds,
        #[error("The account did not have the expected program id")]
        IncorrectProgramId,
        #[error("A signature was required but not found")]
        MissingRequiredSignature,
        #[error("An initialize instruction was sent to an account that has already been initialized")]
        AccountAlreadyInitialized,
        #[error("An attempt to operate on an account that hasn't been initialized")]
        UninitializedAccount,
        #[error("The instruction expected additional account keys")]
        NotEnoughAccountKeys,
        #[error("Failed to borrow a reference to account data, already borrowed")]
        AccountBorrowFailed,
        #[error("Length of the seed is too long for address generation")]
        MaxSeedLengthExceeded,
        #[error("Provided seeds do not result in a valid address")]
        InvalidSeeds,
        #[error("IO Error: {0}")]
        BorshIoError(String),
        #[error("An account does not have enough lamports to be rent-exempt")]
        AccountNotRentExempt,
        #[error("Unsupported sysvar")]
        UnsupportedSysvar,
        #[error("Provided owner is not allowed")]
        IllegalOwner,
        #[error("Accounts data allocations exceeded the maximum allowed per transaction")]
        MaxAccountsDataAllocationsExceeded,
        #[error("Account data reallocation was invalid")]
        InvalidRealloc,
        #[error("Instruction trace length exceeded the maximum allowed per transaction")]
        MaxInstructionTraceLengthExceeded,
        #[error("Builtin programs must consume compute units")]
        BuiltinProgramsMustConsumeComputeUnits,
    }

因此我们的process函数里面必须要返回这里的一个值枚举值。

上面的错误枚举，基本意义还是比较明确的。比如参数不对，Gas不够。相当于系统已经把错误进行了分类。

但是我们合约中的错误其实是每个逻辑不一样的，那么要如何去定义他呢？

这里上面的分类中有一类


    Custom(u32)

这个就是专门给应用合约定义其错误用的，每个错误用一个u32来表示

## 合约错误定义

既然是用u32类区别合约错误，自然我们想到了Rust里面的enum来定义错误：

    #[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
    pub enum HelloWorldError {
        #[error("Not owned by HelloWolrd Program")]
        NotOwnedByHelloWrold,
    }

但是这是我们自定义的枚举，要如何让他变成上面的`Custom(u32)` 呢？因此需要定义转换函数：
    
    impl From<HelloWorldError> for ProgramError {
        fn from(e: HelloWorldError) -> Self {
            ProgramError::Custom(e as u32)
        }
    }

直接将枚举的值，转换成了Custom里面的错误码。

错误码有了，但是错误码对应的意义是什么呢？

    impl PrintProgramError for HelloWorldError {
        fn print<E>(&self)
        where
            E: 'static + std::error::Error + DecodeError<E> + PrintProgramError + FromPrimitive,
        {
            match self {
                HelloWorldError::NotOwnedByHelloWrold => msg!("Error: Greeted account does not have the correct program id!"),
            }
        }
    }

这里通过`PrintProgramError` trate的实现，来定义其错误消息。

这样在出错的时候，返回相应错误。

        if greeting_account.owner != program_id {
            msg!("Greeted account does not have the correct program id");
            return Err(HelloWorldError::NotOwnedByHelloWrold.into());
        }

通过into直接转换。