import { readLines } from "https://deno.land/std@0.114.0/io/mod.ts";

// 行処理
function replaceAozoraTag(line:string){

  return line
    // 行頭字下げはTeXに任せる
    .replace(new RegExp('^　+'),'')
    // 米印 TODO: あとでほかの者にも対応
    .replace(new RegExp('※［＃米印、1-2-8］','g'),'※')
    // 改行
    .replace(new RegExp('［＃改ページ］','g'),'\\columnbreak')
    // 区切り線
    .replace(new RegExp('［＃区切り線］','g'),'\\hrulefill')
    // セクションマーク
    .replace(new RegExp('^[ 　]+§^[ 　]+'),'\\hspace{3\\zw}\\hbox{\\yoko §}')
    // 中揃えの空白文字
    .replace(new RegExp('［　空白　］','g'),'centerline[空白]')

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
    .replace(new RegExp('[0-9]+','g'),function(){
      if(arguments[1].length <= 3){
        return `\\hbox{\\yoko ${arguments[1]}}`
      } else {
        return `${arguments[0]}`
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
    // 左右中央（厳密な中央はあきらめ）
    .replace(new RegExp('［＃ページの左右中央］','g'),'\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
    // 字下げ
    .replace(new RegExp('［＃[１-９]字下げ］','g'),function(){
      let tag=''  
      switch(arguments[1]){
          case '１':
            tag='\\hspace{1\\zw}'
            break
          case '２':
            tag='\\hspace{2\\zw}'
            break
          case '３':
            tag='\\hspace{3\\zw}'
            break
          case '４':
            tag='\\hspace{4\\zw}'
            break
          case '５':
            tag='\\hspace{5\\zw}'
            break
          case '６':
            tag='\\hspace{6\\zw}'
            break
          case '７':
            tag='\\hspace{7\\zw}'
            break
          case '８':
            tag='\\hspace{8\\zw}'
            break
          case '９':
            tag='\\hspace{9\\zw}'
            break
          default:
            // 字下げは行わない
            tag=''
            break
        }
      return tag
    })
    // 開始タグ・終了タグ
    // 前書き
    .replace(new RegExp('［＃ここから前書き］','g'),'\\leftskip=5\\zw\\begin{minipage}{20\\zw}\\hrulefill')
    .replace(new RegExp('［＃ここで前書き終わり］','g'),'\\hrulefill\\end{minipage}\\leftskip=0\\zw')
    // 後書き
    .replace(new RegExp('［＃ここから後書き］','g'),'\\leftskip=5\\zw\\begin{minipage}{20\\zw}\\hrulefill')
    .replace(new RegExp('［＃ここで後書き終わり］','g'),'\\hrulefill\\end{minipage}\\leftskip=0\\zw')
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
      return `\\end{multicols*}\\hspace{1\\zw}${arguments[1]}\\begin{multicols*}{3}`
    })
    // 大見出し
    .replace(new RegExp('［＃大見出し］([^［]+)［＃大見出し終わり］','g'),function(){
      return `\\end{multicols*}\\section{${arguments[1]}}\\begin{multicols*}{3}`
    })
    // 中見出し
    .replace(new RegExp('［＃中見出し］([^［]+)［＃中見出し終わり］','g'),function(){
      return `\\hspace{1\\zw}\\large{\\textbf{${arguments[1]}}}\n\n`
    })

    // 1行1段落とするため空行も合わせて追加 
    + '\n\n'
}












const filePath = Deno.args[0]
const file = await Deno.open(filePath);

const encoder = new TextEncoder();
const distPath = Deno.args[1]

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
         '\\thispagestyle{empty}\n'
       + '\\begin{minipage}{170truemm}\n'
       + '\\null\\vspace{95truemm}\n'
       + '\\begin{center}\n'
       + `{\\LARGE ${title}}\\hspace{2\\zw}{\\large ${author}}`
       + '\\end{center}\n'
       + '\\end{minipage}\n'
       + '\\newpage\n'

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