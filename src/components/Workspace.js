import React from "react";
import ItemCard from "./ItemCard";

export default class Workspace extends React.Component {
    render() {
        const { currentList,
                renameItem,
                moveItem} = this.props;
        if (currentList === null){
            return (
                <div id="top5-workspace">
                    <div id="workspace-edit">
                        <div id="edit-numbering">
                            <div className="item-number">1.</div>
                            <div className="item-number">2.</div>
                            <div className="item-number">3.</div>
                            <div className="item-number">4.</div>
                            <div className="item-number">5.</div>
                        </div>
                    </div>
                </div>
                )   
            }
            else {
                return (
                    <div id="top5-workspace">
                        <div id="workspace-edit">
                            <div id="edit-numbering">
                                <div className="item-number">1.</div>
                                <div className="item-number">2.</div>
                                <div className="item-number">3.</div>
                                <div className="item-number">4.</div>
                                <div className="item-number">5.</div>
                            </div>
                            <div id = "top5-item">
                                {
                                    currentList.items.map((val) => (
                                        <ItemCard
                                            currList = {currentList}
                                            itemRename = {renameItem}
                                            itemMover = {moveItem}
                                            index = {indexOf(currentList, val)}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )
            }
    }
}