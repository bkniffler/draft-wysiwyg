import React from 'react';

import Draft from './components/draft';
import {content} from './data/content';
import Div from "./blocks/resizeable-div";
import Div2 from "./blocks/resizeable-div2";

export default class Example extends React.Component {
    constructor(props) {
        super(props);
        console.log(content);
        this.state = {
            data: content
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
        return (
            <div className="TexEditor-container">
                <div className="TeXEditor-root">
                    <div className="TeXEditor-editor">
                        <Draft renderBlock={this.renderBlock.bind(this)} updateValue={(v)=>this.setState({data:v})} value={data}/>
                    </div>
                </div>

                <button className="TeXEditor-insert"
                        onClick={()=>this.setState({data: Draft.AddBlock(data, 'end', 'div', {}, true)})}>Add Floating
                </button>
                <button className="TeXEditor-insert2"
                        onClick={()=>this.setState({data: Draft.AddBlock(data, 'start', 'div2', {}, true)})}>Add
                    Non-Floating
                </button>

                <pre>{JSON.stringify(data, null, 3)}</pre>
            </div>
        );
    }
}
