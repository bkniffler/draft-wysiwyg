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
                <div className="draft-toolbar" onMouseDown={(x)=>{x.preventDefault()}}>
                    {this.props.actions.map(action =>
                        <div key={action.label} className={action.active ? 'item active' : 'item'}>
                            <button onClick={()=>this.toggleAction(action)} data-tooltip={action.label}>
                                {action.icon ? <i className={action.icon + " icon"}></i> : action.button}
                            </button>
                        </div>
                    )}
                </div>
            </Tooltip>
        );
    }
}
DraftToolbar.defaultProps = {
    actions: []
}
