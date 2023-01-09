import { readLines } from "https://deno.land/std@0.114.0/io/mod.ts";

// 行処理
function replaceAozoraTag(line:string){

  return line
    // 行頭字下げはTeXに任せる
    .replace(new RegExp('^　+'),'')
    // 左右中央（厳密な中央はあきらめ）
    .replace('［＃ページの左右中央］','\\newpage')
    // 米印 TODO: あとでほかの者にも対応
    .replace('※［＃米印、1-2-8］','※')
    // 改行
    .replace('［＃改ページ］','\\columnbreak')
    // 区切り線
    .replace('［＃区切り線］','\\hrulefill')
    // 矢印
    .replace(new RegExp('([→↓←↑])','g'),function(){
      switch (arguments[1]) {
        case '→':
          return '↑'       
          break;
        case '↓':
          return '→'          
          break;
        case '←':
          return '↓'          
          break;
        case '↑':
          return '←'          
          break;
        default:
          return arguments[1]
          break;
      }
    })
    // 字下げ 無視する
    .replace(new RegExp('［＃[１-９]字下げ］'),'')
    // セクションマーク
    .replace(new RegExp('^[ 　]+§^[ 　]+'),'\\hspace{7\\zw}\\hbox{\\yoko §}')
    // 中揃えの空白文字
    .replace(new RegExp('［　空白　］','g'),'\\null\\vfill\\center{空白}\\vfill\\clearpage')

    // 二重山括弧
    .replace(new RegExp('［＃始め二重山括弧］([^［]+)［＃終わり二重山括弧］','g'),function(){
      return `《${arguments[1]}》`
    })
    // 濁点
    .replace(new RegExp('［＃濁点］([^［]+)［＃濁点終わり］','g'),function(){
      return `\\dakuten{${arguments[1]}}`
    })
    // 傍点
    .replace(new RegExp('［＃傍点］([^［]+)［＃傍点終わり］','g'),function(){
      return `\\kenten{${arguments[1]}}`
    })
    // 縦中横
    .replace(new RegExp('［＃縦中横］([^［]+)［＃縦中横終わり］','g'),function(){
      return `\\hbox{\\yoko ${arguments[1]}}`
    })
    // 連数字
    .replace(new RegExp('[0-9]+','g'),function(){
      if(arguments[1].length <= 3){
        return `\\hbox{\\yoko ${arguments[1]}}`
      } else {
        return arguments[0]
      }
    })
    // ルビ
    .replace(new RegExp('｜([^《]+)《([^》]+)》','g'),function(){
      return `\\ruby[g]{${arguments[1]}}{${arguments[2]}}`
    })

    // 挿絵 TODO:対応するか考える
    .replace(new RegExp('［＃挿絵（挿絵/([^）]+)）入る］','g'),function(){
      return `『挿絵${arguments[1]}』`
    })

    // 開始タグ・終了タグ
    // 前書き
    .replace(new RegExp('［＃ここから前書き］','g'),'\\begin{flushright}\\begin{minipage}{17\\zw}')
    .replace(new RegExp('［＃ここで前書き終わり］','g'),'\\hrulefill\\end{minipage}\\end{flushright}')
    // 後書き
    .replace(new RegExp('［＃ここから後書き］','g'),'\\begin{flushright}\\begin{minipage}{17\\zw}\\hrulefill')
    .replace(new RegExp('［＃ここで後書き終わり］','g'),'\\end{minipage}\\end{flushright}')
    // 小書き
    .replace(new RegExp('［＃小書き］([^［]+)［＃小書き終わり］','g'),function(){
      return `\\footnotesize ${arguments[1]} \\normalsize`
    })
    // 地付き
    .replace(new RegExp('［＃ここから地付き］([^［]+)［＃ここで地付き終わり］','g'),function(){
      return `\\rightline{${arguments[1]}}`
    })

    // 大見出しの柱
    .replace(new RegExp('［＃ここから柱］([^［]+)［＃ここで柱終わり］','g'),function(){
      return `\\end{multicols*}\\large{\\hspace{1\\zw}${arguments[1]}}\\begin{multicols*}{3}`
    })
    // 大見出し
    .replace(new RegExp('［＃大見出し］([^［]+)［＃大見出し終わり］','g'),function(){
      return `\\end{multicols*}\\section*{${arguments[1]}}\\begin{multicols*}{3}`
    })
    // 中見出し
    .replace(new RegExp('［＃中見出し］([^［]+)［＃中見出し終わり］','g'),function(){
      return `\\hspace{1\\zw}\\large{\\textbf{${arguments[1]}}}\\newline`
    })

    // 1行1段落とするため空行も合わせて追加 
    + '\n\n'
}












//const filePath = Deno.args[0]
const filePath = "./narou.txt"
const file = await Deno.open(filePath);

const encoder = new TextEncoder();
// const distPath = Deno.args[1]
const distPath = "./TeX/out.tex"

const lineseparator = new RegExp('[\r\n]+')

Deno.copyFile('./TeX/bigin.tex',distPath)          
let index=0
let title=''
try {
  for await (const line of readLines(file)) {
    // タイトル
    if(index === 0){
      index++
      title = replaceAozoraTag(line)
        .replace(lineseparator,'')
      console.log(`Title: ${title}`)
    }
    // 著者
    else if(index === 1){
      index++
      const author=replaceAozoraTag(line)
        .replace(lineseparator,'')
      console.log(`Author: ${author}`)

      const hyoshi=
      // 表紙
         '\\end{multicols*}\n'
       + '\\thispagestyle{empty}\n'
       + '\\null\\vfill'
       + `{\\LARGE ${title}}\\hspace{2\\zw}{\\large ${author}}`
       + '\\vfill'
       + '\\clearpage'
       + '\\newpage\n'
       + '\\begin{multicols*}{3}\n'

       const data = encoder.encode(hyoshi);
       await Deno.writeFile(distPath, data, {append: true});          
    }
    else{
      // const workline = replaceAozoraTag(`${index++}: ${line}`)
      const workline = replaceAozoraTag(line)
      console.log(workline);
      const data = encoder.encode(workline);
      await Deno.writeFile(distPath, data, {append: true});   
    }
  }
} catch (error) {
  throw new Error("failed to read file", { cause: error });
} finally{
  const endTag = '\\end{multicols*}\n\\end{document}\n'
  const data = encoder.encode(endTag);
  await Deno.writeFile(distPath, data, {append: true});          

  file.close();
}
console.log('Done.')