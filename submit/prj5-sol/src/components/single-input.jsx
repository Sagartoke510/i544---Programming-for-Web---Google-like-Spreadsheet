//-*- mode: rjsx-mode;

import React from 'react';
import ReactDom from 'react-dom';

/** Component which displays a single input widget having the following
 *  props:
 *
 *    `id`:     The id associated with the <input> element.
 *    `value`:  An initial value for the widget (defaults to '').
 *    `label`:  The label displayed for the widget.
 *    `update`: A handler called with the `value` of the <input>
 *              widget whenever it is blurred or its containing
 *              form submitted.
 */
export default class SingleInput extends React.Component {

  constructor(props) {
    super(props);
    //@TODO
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {
      value: '',
      error: '',
    };
  }

  //@TODO
  async onSubmit(event){
    try{
    event.preventDefault();
    await this.props.update(this.state.value);
    }
    catch(err){
      this.setState({error: err.message});
    }

  }

  onChange(event){
    const target = event.target;
    const val = target.value;
    this.setState({
      value : val
    });
  }

  render() {
    //@TODO
    return (
      <form onSubmit = {this.onSubmit}>
        <label className= {this.props.id}>{this.props.label} </label>
        <input type = "text" id = {this.props.id} value = {this.state.value} onChange = {this.onChange} onBlur = {this.onSubmit}></input>
        <br/>
        <span className = "error"> {this.state.error}</span>
        </form>
    );
  }

}
