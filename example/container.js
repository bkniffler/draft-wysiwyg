import React from 'react';

import {Div, Div2, Data} from "./draft";
import {Draft, DraftToolbar} from '../src';

Draft.DisableWarnings();

export default class Example extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: Data
        }
    }

    renderBlock(contentBlock, props){
        const type = contentBlock.getType();

        if (type === 'div') {
            return {
                component: Div,
                props
            };
        }
        else if (type === 'div2') {
            return {
                component: Div2,
                props
            };
        }
    }

    render() {
        const {data} = this.state;
        var draftToolbar = (
            <DraftToolbar />
        );
        return (
            <div className="TexEditor-container">
                <div className="TeXEditor-root">
                    <div className="TeXEditor-editor">
                        <Draft toolbar={draftToolbar} renderBlock={::this.renderBlock} updateValue={(v)=>this.setState({data:v})} value={data}/>
                    </div>
                </div>

                <button className="TeXEditor-insert" onClick={()=>this.setState({data: Draft.AddBlock(data, 'end', 'div', {}, true)})}>
                    Horizontal+Vertical
                </button>
                <button className="TeXEditor-insert2" onClick={()=>this.setState({data: Draft.AddBlock(data, 'start', 'div2', {}, true)})}>Add
                    Horizontal only
                </button>

                <pre style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(data, null, 3)}</pre>
            </div>
        );
    }
}
