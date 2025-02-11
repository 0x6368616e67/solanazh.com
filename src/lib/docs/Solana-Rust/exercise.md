# 课后练习

附件中的工程是一个"Tic-Tac-Toe"游戏。

```
X, select a space
 1  | 2  | 3
--------------
 4  | 5  | 6
--------------
 7  | 8  | 9
```

运行后是这样的一个棋盘。两个玩家依次落子。先排成“横”，“竖”，“斜”一条线的赢。

代码中其他文件忽略，只关注 game.rs/board.rs 这两个文件。里面有“TODO”提示。在提示的地方填充函数内容。

最后运行`cargo test` 提示测试通过：

```
running 27 tests
test board::tests::a_space_can_only_be_taken_once ... ok
test board::tests::finds_available_spaces_in_full_board ... ok
test board::tests::o_plays_next ... ok
test board::tests::finds_available_spaces_in_empty_board ... ok
test board::tests::a_space_above_the_board_cant_be_chosen ... ok
test board::tests::a_negative_space_cant_be_chosen ... ok
test board::tests::finds_available_spaces_in_an_in_progress_board ... ok
test board::tests::starts_with_no_moves ... ok
test board::tests::x_plays_first ... ok
test board::tests::takes_a_number_of_rows ... ok
test game::tests::a_tied_game_is_tied ... ok
test game::tests::a_won_game_is_not_tied ... ok
test game::tests::a_won_game_with_a_full_board_is_not_tied ... ok
test game::tests::an_empty_game_is_not_tied ... ok
test game::tests::an_empty_game_is_not_won ... ok
test game::tests::check_if_game_won_by_x_is_won ... ok
test game::tests::check_if_game_won_by_o_is_won ... ok
test game::tests::check_line_won_by_x ... ok
test game::tests::check_if_tied_game_is_won ... ok
test game::tests::check_row_not_won_by_o ... ok
test game::tests::find_winner_when_nobody_has_won ... ok
test game::tests::find_winner_when_o_has_won ... ok
test game::tests::find_winner_when_x_has_won ... ok
test game::tests::game_is_over_when_board_is_full ... ok
test game::tests::o_is_current_player_after_one_move ... ok
test game::tests::game_not_over_when_board_is_empty ... ok
test game::tests::x_is_current_player_at_start_of_game ... ok

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

`cargo run`可以正常游戏

## 参考答案

board.rs

```
    pub fn get_size(&self) -> &i32 {
        // TODO: 返回size
        &self.size
    }

    pub fn get_spaces(&self) -> &Vec<i32> {
        // TODO: 返回spaces
        &self.spaces
    }

        pub fn is_space_available(&self, space: &i32) -> bool {
        // TODO: 调用contains判断 space是否在切片spacees内
        !self.spaces.contains(space)
    }

    fn is_space_in_bounds(&self, space: &i32) -> bool {
        // TODO: 判断space位置是否在棋盘size*size返回内
        let max_space = self.size * self.size;
        let min_space = 0;
        space >= &min_space && space < &max_space
    }

    pub fn get_available_spaces(&self) -> Vec<i32> {
        // TODO: 判断棋盘上是否有位置is_space_available
        // 提示，遍历位置，调用is_space_available方法
        let all_spaces = 0..self.size * self.size;
        all_spaces
            .filter(|space| self.is_space_available(space))
            .collect()
    }
```

game.rs

```
pub fn find_current_player(board: &Board) -> Marker {
    // TODO: 根据棋盘当前的棋子，判断下个棋子，是X还是O
    if board.get_spaces().len() % 2 == 0 {
        Marker::X
    } else {
        Marker::O
    }
}

pub fn find_winner(board: &Board) -> Marker {
    // TODO: 调用is_game_won_by 判断是 X赢了还是O赢了
    if is_game_won_by(board, &Marker::X) {
        Marker::X
    } else if is_game_won_by(board, &Marker::O) {
        Marker::O
    } else {
        Marker::NA
    }
}


```

[练习工程](../assets/files/tic-tac-toe.zip)

[参考答案](../assets/files/tic-tac-toe-answer.zip)
