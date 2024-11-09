// @ts-nocheck
// week 1
import w1l1 from './docs/Solana-Basic/what_is_solana.md';
import w1l2 from './docs/Solana-Basic/core_concepts.md';
import w1l3 from './docs/Solana-Basic/spl_token.md';
import w1l4 from './docs/Solana-Basic/console.md';
import w1l5 from './docs/Solana-Basic/wallet.md';
import w1l6 from './docs/Solana-Basic/exercise.md';
// week 2
import w2l1 from './docs/Interact-With-Solana/rpc.md';
import w2l2 from './docs/Interact-With-Solana/rpc_http.md';
import w2l3 from './docs/Interact-With-Solana/rpc_ws.md';
import w2l4 from './docs/Interact-With-Solana/exercise.md';
// week 3
import w3l1 from './docs/Interact-With-Program/web3.js.md';
import w3l2 from './docs/Interact-With-Program/interact_with_wallet_adapter.md';
import w3l3 from './docs/Interact-With-Program/interact_with_token_program.md';
import w3l4 from './docs/Interact-With-Program/exercise.md';
// week 4
import w4l1 from './docs/Solana-Rust/helloworld.md';
import w4l2 from './docs/Solana-Rust/language.md';
import w4l3 from './docs/Solana-Rust/cargo.md';
import w4l4 from './docs/Solana-Rust/rustaceans.md';
import w4l5 from './docs/Solana-Rust/exercise.md';
// week 5
import w5l1 from './docs/Solana-Program-Part1/hello_world.md';
import w5l2 from './docs/Solana-Program-Part1/basic.md';
import w5l3 from './docs/Solana-Program-Part1/process.md';
import w5l4 from './docs/Solana-Program-Part1/error.md';
import w5l5 from './docs/Solana-Program-Part1/exercise.md';
// week 6
import w6l1 from './docs/Solana-Program-Part2/program_with_vscode.md';
import w6l2 from './docs/Solana-Program-Part2/pda.md';
import w6l3 from './docs/Solana-Program-Part2/inner_call.md';
import w6l4 from './docs/Solana-Program-Part2/sysvar.md';
import w6l5 from './docs/Solana-Program-Part2/exercise.md';

// week 7
import w7l1 from './docs/Expert-Solana-Program/alts.md';
import w7l2 from './docs/Expert-Solana-Program/anchor.md';
import w7l3 from './docs/Expert-Solana-Program/anchor_framework.md';
import w7l4 from './docs/Expert-Solana-Program/exercise.md';
import w7l5 from './docs/Expert-Solana-Program/anchor_proj.md';
// week 8
import w8l1 from './docs/Solana-DApp-Practice/swap.md';
import w8l2 from './docs/Solana-DApp-Practice/metaplex.md';
import w8l3 from './docs/Solana-DApp-Practice/exercise.md';
// week 9
import w9l1 from './docs/Solana-Security/cashio.md';
import w9l2 from './docs/Solana-Security/hack.md';
import w9l3 from './docs/Solana-Security/note.md';

export type TLessonDTO = {
  number: number;
  title: string;
  meta: string[];
  md: any;
};

export type TCourseDTO = {
  number: number;
  title: string;
  lessons: TLessonDTO[];
  locked: boolean;
};

export const CourseMap: TCourseDTO[] = [
  {
    number: 1,
    title: 'Solana 基础知识',
    locked: false,
    lessons: [
      { number: 1, title: 'Solana介绍', meta: [], md: w1l1 },
      { number: 2, title: 'Solana核心概念', meta: [], md: w1l2 },
      { number: 3, title: 'SPL 代币', meta: [], md: w1l3 },
      { number: 4, title: '命令行工具', meta: [], md: w1l4 },
      { number: 5, title: '钱包使用', meta: [], md: w1l5 },
      { number: 6, title: '课后练习', meta: [], md: w1l6 },
    ],
  },
  {
    number: 2,
    title: '通过RPC与Solana交互',
    locked: false,
    lessons: [
      { number: 1, title: 'Solana的RPC介绍', meta: [], md: w2l1 },
      { number: 2, title: '接口RPC', meta: [], md: w2l2 },
      { number: 3, title: '推送RPC', meta: [], md: w2l3 },
      { number: 4, title: '课后练习', meta: [], md: w2l4 },
    ],
  },
  {
    number: 3,
    locked: false,
    title: '与Solana合约交互',
    lessons: [
      { number: 1, title: 'Solana的Web3.js', meta: [], md: w3l1 },
      { number: 2, title: '与钱包交互', meta: [], md: w3l2 },
      { number: 3, title: '合约调用', meta: [], md: w3l3 },
      { number: 4, title: '课后练习', meta: [], md: w3l4 },
    ],
  },
  {
    number: 4,
    locked: false,
    title: 'Rust基本知识',
    lessons: [
      { number: 1, title: 'Hello World', meta: [], md: w4l1 },
      { number: 2, title: 'Rust基本语法', meta: [], md: w4l2 },
      { number: 3, title: '通过Cargo管理工程', meta: [], md: w4l3 },
      { number: 4, title: 'Rustaceans的理解', meta: [], md: w4l4 },
      { number: 5, title: '课后练习', meta: [], md: w4l5 },
    ],
  },
  {
    number: 5,
    locked: false,
    title: 'Solana合约开发 Part.1',
    lessons: [
      { number: 1, title: 'Hello World', meta: [], md: w5l1 },
      { number: 2, title: 'Solana合约基础概念', meta: [], md: w5l2 },
      { number: 3, title: 'Solana合约处理逻辑', meta: [], md: w5l3 },
      { number: 4, title: 'Solana合约错误定义', meta: [], md: w5l4 },
      { number: 5, title: '课后练习', meta: [], md: w5l5 },
    ],
  },
  {
    number: 6,
    locked: false,
    title: 'Solana合约开发 Part.2',
    lessons: [
      { number: 1, title: '使用VS Code开发合约', meta: [], md: w6l1 },
      { number: 2, title: 'PDA账号', meta: [], md: w6l2 },
      { number: 3, title: '合约间调用CPI', meta: [], md: w6l3 },
      { number: 4, title: '系统变量', meta: [], md: w6l4 },
      { number: 5, title: '课后练习', meta: [], md: w6l5 },
    ],
  },
  {
    number: 7,
    locked: false,
    title: 'Solana合约开发进阶',
    lessons: [
      { number: 1, title: 'ALTs 交易', meta: [], md: w7l1 },
      { number: 2, title: 'Solana序列化标准Anchor协议', meta: [], md: w7l2 },
      { number: 3, title: 'Anchor开发框架', meta: [], md: w7l3 },
      { number: 4, title: 'Anchor实践', meta: [], md: w7l5 },
      { number: 5, title: '课后练习', meta: [], md: w7l4 },
    ],
  },
  {
    number: 8,
    locked: false,
    title: 'Solana DApp开发实践 DeFi & NFT',
    lessons: [
      { number: 1, title: 'TokenSwap合约走读', meta: [], md: w8l1 },
      { number: 2, title: 'Solana的NFT事实标准Metaplex', meta: [], md: w8l2 },
      { number: 3, title: '课后练习', meta: [], md: w8l3 },
    ],
  },
  {
    number: 9,
    locked: false,
    title: 'Solana合约安全',
    lessons: [
      { number: 1, title: 'Cashio 攻击事件分析', meta: [], md: w9l1 },
      { number: 2, title: '经典科学家手段', meta: [], md: w9l2 },
      { number: 3, title: '合约开发安全注意点', meta: [], md: w9l3 },
    ],
  },
];
