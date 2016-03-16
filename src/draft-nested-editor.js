import React, {Component, PropTypes} from "react";
import ReactDOM from 'react-dom';
import Draft from './draft';

export default class DraftEditorBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            readOnly: true,
            v: null
        };
        this.listener = this.listener.bind(this);
    }

    shouldComponentUpdate(props, state){
        if(this.state.readOnly !== state.readOnly){
            return true;
        }
        /*if(this.props.blockProps.editorProps.readOnly !== props.blockProps.editorProps.readOnly){
            if(props.blockProps.editorProps.readOnly && state.readOnly === false){
                this.setState({readOnly: true});
            }
            return false;
        }*/
        return false;
    }

    focus(e){
        if(!this.state.readOnly || this.props.readOnly){
            return;
        }
        setTimeout(()=>{
            this.props.blockProps.setReadOnly(true);
            this.setState({readOnly: false});
        }, 1);
        document.addEventListener('mousedown', this.listener, false);
    }

    listener(e) {
        var component = ReactDOM.findDOMNode(this.refs.div);
        var editor = findAncestor(component, 'DraftEditor-root');
        if (e.target === component || component.contains(e.target) || !editor.contains(e.target)) {
            return;
        }
        document.removeEventListener('mousedown', this.listener, false);
        this.props.blockProps.setReadOnly(false);
        this.setState({readOnly: true});
    }

    render() {
        return (
            <div ref="div" onMouseDown={::this.focus}>
                <Draft {...this.props.blockProps.editorProps} value={this.props.value} updateValue={::this.props.onChange} readOnly={this.state.readOnly}/>
            </div>
        );
    }
}

function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}