import React from 'react'
import styled from 'styled-components'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/mode/shell/shell'

const Containner = styled.div`
  position: relative;
  margin: 2em auto;
  border-radius: 5px;
  & .CodeMirror-gutters {
    background-color: unset;
    border-right: none;
  }
  & .CodeMirror__container {
    min-width: inherit;
    position: relative;
    z-index: 1;
  }
  & .CodeMirror__container .CodeMirror {
    height: auto;
    min-width: inherit;
    padding: 18px 18px;
    padding-left: 12px;
    padding-left: 12px;
    border-radius: 5px;
    font-family: Menlo, Monaco, 'Courier New', monospace !important;
    font-size: 14px;
    line-height: 133%;
    font-variant-ligatures: contextual;
    font-feature-settings: 'calt' 1;
    user-select: none;
  }

  & .CodeMirror-scroll, & .CodeMirror-hscrollbar {
    overflow: hidden !important;
  }
  & .window-theme__sharp > .CodeMirror {
    border-radius: 0px;
  }
  & .window-theme__bw > .CodeMirror {
    border: 2px solid red;
  }
  & .window-controls + .CodeMirror__container > .CodeMirror {
    padding-top: 48px;
  }
  & .CodeMirror-linenumber {
    cursor: pointer;
  }
`

export default ({ children, className = '' }) => {
  let mode = className.split('-')[1] || 'plaintext'
  if (mode === 'js' || mode === 'javascript' || mode === 'json') mode = 'jsx'
  console.warn('mode', mode)
  return (
    <Containner>
      {/* <WindowControls
          theme={'none'}
          code={this.props.children}
          copyable={this.props.copyable}
          light={light}
        /> */}
      <CodeMirror
        className={`CodeMirror__container window-theme__none`}
        // 去除首位换行符
        value={children.replace(/^\r?\n+|\r?\n+$/g, '')}
        options={{
          lineNumbers: true,
          firstLineNumber: 1,
          mode: mode,
          theme: 'monokai',
          scrollBarStyle: null,
          viewportMargin: Infinity,
          lineWrapping: false,
          smartIndent: true,
          tabSize: 2,
          extraKeys: {
            'Shift-Tab': 'indentLess'
          },
          readOnly: 'nocursor', // false,
          showInvisibles: false,
        }}
        // onBeforeChange={this.onBeforeChange}
        // onGutterClick={this.props.onGutterClick}
        // onSelection={this.onSelection}
      />
      <div className="container-bg">
        <div className="white eliminateOnRender" />
        <div className="alpha eliminateOnRender" />
        <div className="bg" />
      </div>
    </Containner>
  )
}