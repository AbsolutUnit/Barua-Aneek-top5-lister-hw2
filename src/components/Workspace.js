import React from "react";
import ItemCard from "./ItemCard";

export default class Workspace extends React.Component {
    render() {
        const { currentList,
                renameItemCallback,
                moveItemCallback} = this.props;
        return (
            <div id = "top5-workspace">
                <div id = "workspace-edit">
                    <div id = "edit-numbering">
                        <div className = "item-number">1.</div>
                        <div className = "item-number">2.</div>
                        <div className = "item-number">3.</div>
                        <div className = "item-number">4.</div>
                        <div className = "item-number">5.</div>
                    </div>
                    <div id = "edit-items">
                        {currentList && currentList.items.map(function(val, key){
                            return <ItemCard
                            name = {val}
                            index = {key}
                            listK = {currentList.key}
                            renameItemCallback = {renameItemCallback}
                            addMoveItemTransaction = {moveItemCallback}
                            />;
                        })}
                    </div>
                </div>
            </div>
        )
    }
}