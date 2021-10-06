import React from "react";

export default class ItemCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            defaultVal : "top5-item",
            text: this.props.name,
            editActive: false
        }
    }
    handleClick = (event) => {
        if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }

    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        });
    }
    handleUpdate = (event) => {
        this.setState({ text: event.target.value });
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = () => {
        let new_name = this.state.text;
        console.log(this.props.index);
        let ind = this.props.index;
        console.log("ItemCard handleBlur: " + ind);
        //rename trans
        this.props.renameItemCallback(this.props.listK, new_name, ind);
        this.handleToggleEdit();
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("text", event.target.id);
        console.log(event.target.id);
    }
    
    handleDragOver = (ev) => {
        ev.preventDefault();
    }
    
    handleDrop = (ev) => {
        ev.preventDefault();
        let target = ev.target.id;
        target = target.substring(target.length - 1);
        let origin = ev.dataTransfer.getData("text");
        origin = origin.substring(origin.length - 1);
        // console.log(origin);
        // console.log(target);
        this.props.addMoveItemTransaction(origin, target);
        this.setState({
            defaultVal : "top5-item"
        });
    }
    
    handleDragHighlight = (ev) => {
        console.log("Highlighting");
        this.setState(
            {defaultVal : "top5-item-dragged-to"}
        );
    }

    handleDragUnhighlight = (ev) => {
        this.setState(
            {defaultVal : "top5-item"}
        );
    }

    


    render() {

        if (this.state.editActive) {
            return (
                <input //change this stuff class name, id, default value
                    id={"item-" + this.props.index}
                    className='top5-item'
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={this.props.name}
                />)
        }
        else {
            return (
                <div //id key, onclick, classname, 
                    id={"item-" + this.props.index}
                    draggable = "true"
                    key={this.props.name}
                    onClick={this.handleClick}
                    onDragStart = {this.handleDragStart}
                    onDragEnter = {this.handleDragHighlight}
                    onDragLeave = {this.handleDragUnhighlight}
                    onDragOver = {this.handleDragOver}
                    onDrop = {this.handleDrop}
                    className={this.state.defaultVal}>
                        {this.props.name}
                </div>
            );
        }
    }
}