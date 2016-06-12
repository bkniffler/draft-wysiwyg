import React from 'react';
import { RichUtils } from 'draft-js';
import Editor from '../src';
import { Blocks, Data } from './draft';
import request from 'superagent';
import createToolbarPlugin from 'draft-js-toolbar-plugin';
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

    upload = (data, success, failed, progress) => {
        console.log(data.formData);
        request.post('/upload')
            .accept('application/json')
            .send(data.formData)
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

    defaultData = (blockType) => {
        if (blockType === 'block-image') {
            return {
                url: '/whoa.jpg',
            }
        }
        return {};
    }

    renderSide(){
       return (
           <div className="sidepanel">
               <span className="info">Drag & Drop one of these</span>
               {Object.keys(Blocks).filter(key=>key.indexOf('header-')!==0&&key!=='unstyled').concat(['block-image', 'block-table']).map(key=> {
                   var startDrag = (e)=>{
                       e.dataTransfer.dropEffect = 'move';
                       e.dataTransfer.setData("text", 'DRAFTJS_BLOCK_TYPE:'+key);
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
                    <a className="github-button" href="https://github.com/bkniffler/draft-wysiwyg/" target="_blank">
                        View on Github
                    </a>
                    <button className={"button"+(view==='json'?' active':'')} onClick={()=>this.setState({view: 'json'})}>
                        See JSON
                    </button>
                    <button className={"button"+(view==='edit'?' active':'')} onClick={()=>this.setState({view: 'edit'})}>
                        See Editor
                    </button>
                    <button className="button" onClick={::this.save}>
                        {saved ? 'Saved!' : 'Save to localstorage'}
                    </button>
                    <button className="button" onClick={(v)=>this.setState({data:null})}>
                        Clear
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
                    <pre style={{whiteSpace: 'pre-wrap', width: '750px', margin: 'auto'}}>{JSON.stringify(data, null, 3)}</pre>
                </div>
                <div className="container-content" style={{display: view!=='json' ? 'block' : 'none'}}>
                    <div className="TeXEditor-root">
                        <div className="TeXEditor-editor">
                            <Editor onChange={data=>this.setState({data})}
                                    value={data}
                                    blockTypes={Blocks}
                                    cleanupTypes="*"
                                    sidebar={0}
                                    handleDefaultData={this.defaultData}
                                    handleUpload={this.upload}
                                    toolbar={{
                                      disableItems: ['H5'],
                                      textActions: [
                                      {
                                        button: <span>Quote</span>,
                                        label: 'Quote',
                                        active: (block, editorState) => block.get('type') === 'blockquote',
                                        toggle: (block, action, editorState, setEditorState) => setEditorState(RichUtils.toggleBlockType(
                                          editorState,
                                          'blockquote'
                                        )),
                                      }]
                                    }}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
