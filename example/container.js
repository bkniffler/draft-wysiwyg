import React from 'react';

import {Data, Blocks} from "./draft";
import {Draft, DraftToolbar} from '../src';
import {DisableWarning} from '../src/draft-utils';
import request from 'superagent';


DisableWarning();

export default class Example extends React.Component {
    constructor(props) {
        super(props);

        var data = localStorage.getItem("data");
        var oldHash = localStorage.getItem("hash");
        var hash = this.hash = function(s){
            return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        }(JSON.stringify(Data))+'';

        if(data && oldHash === hash){
            try{
                data = JSON.parse(data);
            }
            catch(err){
                data = null;
                console.error(err);
            }
        }
        else{
            data = null;
        }
        this.state = {
            data: data || Data,
            view: 'edit',
            saved: false
        }
    }

    renderBlock(contentBlock, props){
        const type = contentBlock.getType();
        var block = Blocks[type];
        if (block) {
            return {
                component: block,
                props
            };
        }
    }

    save(){
        localStorage.setItem("data", JSON.stringify(this.state.data));
        localStorage.setItem("hash", this.hash);

        this.setState({
            saved: true
        });
        setTimeout(()=>{
            this.setState({
                saved: false
            });
        }, 1500)
    }

    upload(data, success, failed, progress){
        request.post('/upload')
            .accept('application/json')
            .send(data)
            .on('progress', ({ percent }) => {
                progress(percent);
            })
            .end((err, res) => {
                if (err) {
                    return failed(err);
                }
                success(res.body.files, 'image');
            });
    }
    renderSide(){
       return (
           <div className="sidepanel">
               <span className="info">Drag & Drop one of these</span>
               {Object.keys(Blocks).map(key=> {
                   var startDrag = (e)=>{
                       e.dataTransfer.dropEffect = 'move';
                       e.dataTransfer.setData("text", 'type:'+key);
                   }
                   return (
                       <div key={key} className="item" draggable="true" onDragStart={startDrag} style={{cursor: "move"}}>
                           {key}
                       </div>
                   )
               })}
           </div>
       )
    }
    render() {
        const {data, view, saved} = this.state;
        
        return (
            <div className="flex-container">
                <div className="head">
                    <div className="logo">Draft-Wysiwyg</div>
                    <button className={"button"+(view==='json'?' active':'')} onClick={()=>this.setState({view: 'json'})}>
                        See JSON
                    </button>
                    <button className={"button"+(view==='edit'?' active':'')} onClick={()=>this.setState({view: 'edit'})}>
                        See Editor
                    </button>
                    <button className="button" onClick={::this.save}>
                        {saved ? 'Saved!' : 'Save to localstorage'}
                    </button>
                    {/*<button className="button" onClick={()=>this.setState({data: Draft.AddBlock(data, 'end', 'div', {}, true)})}>
                        Horizontal+Vertical
                    </button>
                    <button className="button" onClick={()=>this.setState({data: Draft.AddBlock(data, 'start', 'div2', {}, true)})}>Add
                        Horizontal only
                    </button>
                    <button className="button" onClick={()=>this.setState({data: Draft.AddBlock(data, 'start', 'youtube', {}, true)})}>Add
                        Youtube
                    </button>*/}
                </div>
                {this.renderSide()}
                <div className="container-content" style={{display: view==='json' ? 'block' : 'none'}}>
                    <pre style={{whiteSpace: 'pre-wrap', width: '900px', margin: 'auto'}}>{JSON.stringify(data, null, 3)}</pre>
                </div>
                <div className="container-content" style={{display: view!=='json' ? 'block' : 'none'}}>
                    <div className="TeXEditor-root">
                        <div className="TeXEditor-editor">
                            <Draft renderBlock={::this.renderBlock} updateValue={(v)=>this.setState({data:v})} value={data}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
