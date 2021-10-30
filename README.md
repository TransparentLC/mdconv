# mdconv

[![CI](https://github.com/TransparentLC/mdconv/actions/workflows/ci.yml/badge.svg)](https://github.com/TransparentLC/mdconv/actions/workflows/ci.yml)

![](https://ae01.alicdn.com/kf/Hc12855789d4e4da9873ad1a75a7e97a1V.png)

~~不是第一个也不会是最后一个的~~将 Markdown 文件转换为 PDF 文档的工具，也可以把作为中间产物的 HTML 导出。

虽然有 [Pandoc](https://pandoc.org/) 这种工具，或者可以直接在浏览器和 [Puppeteer](https://github.com/puppeteer/puppeteer) 中另存为 PDF，不过前者对 CSS 样式的支持有限，后者导出的 PDF 缺少了大纲，所以为了兼顾这两个还是自己造了一个轮子 (｡•̀ᴗ-)✧

提供开箱即用的 Windows 打包版，可以在[这里](https://nightly.link/TransparentLC/mdconv/workflows/ci/master)下载。

## 使用方式

```bash
# 输出HTML
node index.js -i example.md -o example.html
# 输出PDF，并且指定字体名称
node index.js -i example.md -o example.pdf --cf 微软雅黑
# 输出PDF，并且指定字体文件路径
node index.js -i example.md -o example.pdf --cf C:\Windows\Fonts\SourceHanSansSC-Regular.otf --mf C:\Windows\Fonts\CascadiaCode.ttf
# 查看参数说明
node index.js --help
```

详细的参数说明后述。

* 从源代码运行的话，需要安装 [Node.js](https://nodejs.org/) 和 [wkhtmltopdf](https://wkhtmltopdf.org/downloads.html)（保证可执行文件的路径在 PATH 里面），然后 `npm install`。只在 Windows 下进行过测试，并不能保证可以在 Linux 下运行。
* 打包版不需要安装 Node.js 和 wkhtmltopdf。优先使用已安装的 wkhtmltopdf，如果未安装则会将自带的可执行文件释放到临时目录并使用。需要把命令中的 `node index.js` 替换成打包版的可执行文件名称。

## 参数说明

| 参数 | 简写 | 说明 |
| - | - | - |
| `--input` | `-i` | 输入的 Markdown 文件路径。 |
| `--output` | `-o` | 输出文件路径，可以使用 `.html` 或 `.pdf` 作为输出格式。 |
| `--markdown-theme` | `--mt` | Markdown 渲染主题，默认为 `github`。 |
| `--highlight-theme` | `--ht` | 代码高亮主题，默认为 `github`。 |
| `--custom-content-font` | `--cf` | 自定义正文部分字体，可以设置字体文件路径或字体名称，也可以留空。<br>输出 PDF 时基本上是必须设置的，注意事项后述。 |
| `--custom-monospace-font` | `--mf` | 自定义代码部分字体，同上。 |
| `--custom-style` |  | 自定义的 CSS 样式文件路径。 |
| `--pdf-size` |  | 输出 PDF 大小，默认为 A4。 |
| `--proxy` |  | 代理服务器地址，输出 PDF 中加载图片资源时会用到。 |
| `--enable-macro` |  | 像 C 语言中的宏一样，对 Markdown 文件中的特定标记进行替换。 |
| `--show-fonts` |  | 查看可以选择的字体名称和路径。 |
| `--help` |  | 显示参数说明。 |

目前可以选择的 Markdown 渲染主题（点击查看示例）：

* [github](https://s3plus.meituan.net/v1/mss_550586ef375b493da4aa79bebdfce4fa/csc-apply-file-web/prod/2021-10-30/880f835c-93c3-4f39-b683-43199395975anull) 修改自 [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)
* [vue](https://s3plus.meituan.net/v1/mss_550586ef375b493da4aa79bebdfce4fa/csc-apply-file-web/prod/2021-10-30/7aa01c49-805d-4810-aedd-d895d74895c2null) 修改自 docsify 的 [Vue 主题](https://docsify.js.org/#/themes)
* [cayman](https://s3plus.meituan.net/v1/mss_550586ef375b493da4aa79bebdfce4fa/csc-apply-file-web/prod/2021-10-30/e458b3e1-d4ad-4690-84e1-64e8c862b2d1null) 修改自 GitHub Pages 的 [Cayman 主题](https://github.com/pages-themes/cayman)
* [lark](https://s3plus.meituan.net/v1/mss_550586ef375b493da4aa79bebdfce4fa/csc-apply-file-web/prod/2021-10-30/dd2d66e2-33d4-49d6-9ec2-7ed29e781366null) 修改自 Typora 的 [Lark 主题](https://theme.typora.io/theme/Lark/)

默认的代码高亮主题来自 [LukeAskew/prism-github](https://github.com/LukeAskew/prism-github)，也可以选择其他的 [Prism 官方主题](https://github.com/PrismJS/prism-themes)。

使用 `--enable-macro` 参数后可以替换的标记：

* `%MDCONV_VERSION%` 版本号
* `%MARKDOWN_THEME%` 使用的 Markdown 渲染主题
* `%HIGHLIGHT_THEME%` 使用的代码高亮主题
* `%CONTENT_FONT%` 使用的正文部分字体的 Postscript 名称，没有设置的话是 `null`
* `%MONOSPACE_FONT%` 使用的代码部分字体的 Postscript 名称，没有设置的话是 `null`
* `%DATE%` 生成文档的日期，格式为 `YYYY-MM-DD`
* `%TIME%` 生成文档的时间，格式为 `HH:MM:SS`
* `%DATETIME%` 等效于 `%DATE% %TIME%`，也就是 `YYYY-MM-DD HH:MM:SS` 格式的完整时间

输出 PDF 时，如果不设置字体，调用 wkhtmltopdf 将解析 Markdown 后的 HTML 转换为 PDF 时选用的字体是不可预料的（一般是宋体等系统默认字体），代码部分的默认等宽字体样式还会受到 Katex 数学公式渲染或主题的影响变成非等宽字体，因此需要手动设置字体。可以输入已安装的字体的以下参数之一来设置：

* 文件路径：`C:\WINDOWS\fonts\SourceHanSansCN-Regular.otf`
* Postscript 名称：`SourceHanSansCN-Regular`
* 显示的名称和字重：`Source Han Sans CN Regular`、`思源黑体 CN Regular`

初次转换或已安装的字体有变更时，需要读取已安装的字体，生成并缓存字体名称到字体文件路径的映射。

输出 HTML 时没有自定义字体的必要，使用浏览器打开时基本不会有以上的问题。

## 关于 `bin/wkhtmltopdf.exe`

在 Windows 打包版中嵌入的 wkhtmltopdf 可执行文件，提取自原版安装包，使用 `upx --ultra-brute` 进行了压缩。

提取和压缩过程可以参考 `fetch-wkhtmltopdf.bat`，运行这个批处理脚本需要安装 7-Zip、curl 和 upx。