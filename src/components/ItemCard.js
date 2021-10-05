import React from "react";

export default class ItemCard extends React.Component {
    constructor(props) {
        super(props);
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
        let textValue = this.state.text;
        console.log("ItemCard handleBlur: " + textValue);
        this.props.renameItem(textValue);
        this.handleToggleEdit();
    }

    render() {

        if (this.state.editActive) {
            return (
                <input
                    id={"item-" + this.index}
                    className='item-card'
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={keyNamePair.name}
                />)
        }
        else {

            return (
                <div
                    onClick={this.handleClick}
                    className={'item-card ' + selectClass}>
                    <span
                        id={"item-card-text-" + keyNamePair.key}
                        key={keyNamePair.key}
                        className="item-card-text">
                        {keyNamePair.name}
                    </span>
                    <input
                        type="button"
                        id={"delete-list-" + keyNamePair.key}
                        className="item-card-button"
                        onClick={this.handleDeleteList}
                        value={"\u2715"} />
                </div>
            );
        }
    }
}