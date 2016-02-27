import React, {Component, PropTypes} from "react";
import {Editor, EditorState, RichUtils} from "draft-js";
import Tooltip from './tooltip'

export default class DraftToolbar extends Component {
    constructor(props) {
        super(props);
    }

    toggleAction(action) {
        if (action.toggle) {
            action.toggle(action, !action.active);
        }
    }

    render() {
        return (
            <Tooltip {...this.props}>
                <div className="ui icon menu" onMouseDown={(x)=>{x.preventDefault()}}>
                    {this.props.actions.map(action =>
                        <a key={action.label} onClick={()=>this.toggleAction(action)}
                           className={action.active ? 'active item' : 'item'} data-tooltip={action.label}>
                            <i className={action.icon + " icon"}></i>
                        </a>
                    )}
                </div>
            </Tooltip>
        );
    }
}
DraftToolbar.defaultProps = {
    actions: []
}
