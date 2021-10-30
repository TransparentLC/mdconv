# 认识 Markdown

![Markdown logo](https://ae01.alicdn.com/kf/H76c33e213d744eceb779afb7031b127ff.png)

Markdown 是一种用来写作的轻量级标记语言，它用简洁的语法代替排版，而不像一般我们用的字处理软件 Word 或 Pages 有大量的排版、字体设置。它使我们专心于码字，使用标记语法来代替常见的排版格式。

目前来看，支持 Markdown 语法的编辑器有很多，很多网站也支持了 Markdown 的文字录入。Markdown 从写作到完成，导出格式随心所欲，你可以导出 HTML 格式的文件用来网站发布，也可以十分方便的导出 PDF 格式，这种格式写出的简历更能得到 HR 的好感，甚至可以使用一些云服务工具直接上传至网页用来分享你的文章。

# 语法说明

* [创始人 John Gruber 的 Markdown 语法说明](https://daringfireball.net/projects/markdown/syntax)
* [GitHub 的 Markdown 指南](https://docs.github.com/cn/free-pro-team@latest/github/writing-on-github/basic-writing-and-formatting-syntax)
* [Markdown 语法说明（简体中文版）](https://github.com/riku/Markdown-Syntax-CN/blob/master/syntax.md)

# 使用 Markdown 有什么优点？

* 专注你的文字内容而不是排版样式，安心写作。
* 轻松的导出 HTML、PDF 和本身的 .md 文件。
* 纯文本内容，兼容所有的文本编辑器与字处理软件。
* 随时修改你的文章版本，不必像字处理软件生成若干文件版本导致混乱。
* 可读、直观、学习成本低。

> 以上部分文字内容参考自：[认识与入门 Markdown - 少数派](https://sspai.com/post/25137)

# Markdown 功能展示

## 代码高亮

```js
import { readFile } from 'fs';

// 从 fs 模块中导入了 readFile

readFile('./foo.txt', (err, source) => {
    if (err) {
        console.error(err);
    } else {
        console.log(source);
    }
});
```

```py
# Fibonacci series up to n
def fib(n):
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a + b
```

```
这个代码块没有指定语言，也就是纯文本。
当然并不会被高亮……只是一起修改了背景色而已。
```

这里还有一个行内代码块：`npm install`，也不会被高亮。

## 数学公式

```
$$
    \begin{pmatrix}
    1 & a_1 & a_1^2 & \cdots & a_1^n \\
    1 & a_2 & a_2^2 & \cdots & a_2^n \\
    \vdots & \vdots & \vdots & \ddots & \vdots \\
    1 & a_m & a_m^2 & \cdots & a_m^n \\
    \end{pmatrix}
$$
```

这里还有一条行内公式：`$$ f(x,y) = \sqrt{x^2+y^2} $$`

## 表格

可以靠左、靠右或居中对齐列中的文本：

| Left-aligned | Center-aligned | Right-aligned |
| :---         |     :---:      |          ---: |
| git status   | git status     | git status    |
| git diff     | git diff       | git diff      |

可以在表格中使用格式，如链接、内联代码块和文本样式：

| Command | Description |
| --- | --- |
| `git status` | List all *new or modified* files |
| `git diff` | Show file differences that **haven't been** staged |

## 嵌套列表

* 第一层甲
* 第一层乙
    * 第二层甲
    * 第二层乙
        1. 第三层甲
        2. 第三层乙
    * 第二层丙
        * 第三层丙
        * 第三层丁

## 按键指示

其实就是用 `<kbd>` 包裹文字。例如：<kbd>Ctrl+C</kbd> 和 <kbd>Ctrl+V</kbd> 分别对应复制和粘贴功能。

---

<div style="text-align:right">

<small>*本文档使用 [mdconv %MDCONV_VERSION%](https://github.com/TransparentLC/mdconv) 于 %DATETIME% 生成<br>主题：%MARKDOWN_THEME% %HIGHLIGHT_THEME%<br>字体：%CONTENT_FONT% %MONOSPACE_FONT%*</small>

</div>