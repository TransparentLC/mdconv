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
node index.js -i example.md -o example.pdf -f 微软雅黑
# 输出PDF，并且指定字体文件路径
node index.js -i example.md -o example.pdf -f C:\Windows\Fonts\SourceHanSansSC-Regular.otf
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
| `--custom-font` | `-f` | 自定义正文部分字体，可以设置多个字体名称或字体文件路径，也可以留空。<br>输出 PDF 时基本上是必须设置的，注意事项后述。 |
| `--custom-style` |  | 自定义的 CSS 样式文件路径。 |
| `--pdf-size` |  | 输出 PDF 大小，默认为 A4 |
| `--enable-katex` |  | 启用 Katex 进行数学公式渲染，默认不启用。 |
| `--help` |  | 显示参数说明。 |

目前可以选择的 Markdown 渲染主题（点击查看示例）：

* [github](https://s3plus.meituan.net/v1/mss_550586ef375b493da4aa79bebdfce4fa/csc-apply-file-web/prod/2021-07-22/a50a31dd-7386-4444-bd13-7f15fc71a591null) 修改自 [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)
* [vue](https://s3plus.meituan.net/v1/mss_550586ef375b493da4aa79bebdfce4fa/csc-apply-file-web/prod/2021-07-22/373596b0-d0ba-466b-b2a4-c95aa2fd8c0fnull) 修改自 docsify 的 [Vue 主题](https://docsify.js.org/#/themes)
* [cayman](https://s3plus.meituan.net/v1/mss_550586ef375b493da4aa79bebdfce4fa/csc-apply-file-web/prod/2021-07-22/5659702e-0c2d-48f5-8704-a1905d086da9null) 修改自 GitHub Pages 的 [cayman 主题](https://github.com/pages-themes/cayman)

代码高亮主题来自 [Prism 官方主题](https://github.com/PrismJS/prism-themes)。部分深色风格主题可能需要额外修改，以下是确定可用的深色风格主题：

* nord
* vs
* vsc-dark-plus

## 关于字体设置

输出 PDF 时，如果不设置字体，调用 wkhtmltopdf 将解析 Markdown 后的 HTML 转换为 PDF 时选用的默认字体是不可预料的（一般是宋体等系统默认字体），因此需要手动设置字体。

可以直接输入字体名称，但是 wkhtmltopdf 对字体名称的解析存在问题，比如输入“微软雅黑”、“等线”和“苹方 中等”没有问题，但是输入“Microsoft YaHei”和“思源黑体 常规”就没有效果，因此请用字体的多个名称试试看，或者**直接指定字体文件的路径**。

启用 Katex 后会在 HTML 中定义一些用于显示数学公式的字体和样式，但是**在生成的 PDF 中代码部分原本的等宽字体样式会失效**（使用 cayman 主题也会有这种问题），因此默认不启用，如果没有代码部分且有大量公式则可以启用。

以上都是 wkhtmltopdf 关于自定义字体的坑 ┐(´-｀)┌

输出 HTML 时没有自定义字体的必要，使用浏览器打开时基本不会有以上的问题。

## 关于 `bin/wkhtmltopdf.exe`

在 Windows 打包版中嵌入的 wkhtmltopdf 可执行文件，提取自原版安装包，使用 `upx --ultra-brute` 进行了压缩。

提取和压缩过程可以参考 `fetch-wkhtmltopdf.bat`。