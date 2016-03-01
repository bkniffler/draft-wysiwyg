import React, {Component, PropTypes} from "react";
import ReactDOM from 'react-dom';
import {Draft} from '../src';

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
        return false;
    }

    focus(){
        if(!this.state.readOnly){
            return;
        }
        this.props.blockProps.setReadOnly(true);
        this.setState({readOnly: false});
        document.addEventListener('mousedown', this.listener, false);
    }

    listener(e) {
        var component = ReactDOM.findDOMNode(this.refs.div);
        if (e.target === component || component.contains(e.target)) {
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