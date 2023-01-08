# はじめに

SONY電子ノート[DPT-PR1](https://www.sony.jp/digital-paper/products/DPT-RP1/)で段組みした[青空文庫](https://www.aozora.gr.jp/)テキストを読むためまでの記録

## なぜ始めたのか

- SONY電子書籍リーダ[PRS-350](https://www.sony.jp/reader/products/PRS-350/?s_srch=all)で軽さと画面サイズ、電子ペーパーの良さを感じていて、DPT-PR1でも試したかったため。

## PDF化について

- DPT-PR1はEPUBに対応していないため表示するにはPDF化が必要
- A4サイズ相当ではあるが、A4サイズではなくページサイズの枠線が目立つため、画面サイズとピッタリにしたい
- 2段組みだと1行が長すぎると感じる
PRS-350に慣れすぎ？

独自サイズの縦組みPDFを今回はLuaLaTeXで作成する

## 入力データフォーマットについて

- 青空文庫の成果物を想定
[青空文庫作業マニュアル【入力編】](https://www.aozora.gr.jp/aozora-manual/index-input.html)

## 組版エンジン

- RaspberyPi4にDebian[Tested images](https://raspi.debian.net/tested-images/)をインストールしてaptで日本語組版のみを入れてもLuaLaTeXがうまく動かず
  - 調べていたら過去の互換性をとるか海外に合わせるかいろいろあるらしい
  - 今回はArch Linux上のLuaLaTexの環境とした
- [Linux での TeX Live のインストールと設定](https://texjp.org/install/linux.html)
  - TeXのインストーラを利用したら目的を達成出来た。
  - うまくいかなかったのがフルインストールでなかったからかは分からない

## 組版スタイル

- jlreqのA4カスタム・縦書き・3段組スタイルを作成
- 参考: [LaTeX（LuaLaTeX 《 jlreq 》） で A5・縦書き・2段組の小説本・エッセイ本を作る](https://adbird.hatenablog.com/entry/2022/05/08/130208)

## 仮組

- 青空文庫形式のテキストをエディタの正規表現でTeXに変換
  - 組版結果は良好

## 自動化

- これから
- Raspbery Pi4(Arm64v8)で[Deno](https://deno.land/)が使えるようにソースコードをビルド
    - dockerhub:[tackn/deno](https://hub.docker.com/repository/docker/tackn/deno/general)
    - Denoの勉強中でもあるので題材とする
