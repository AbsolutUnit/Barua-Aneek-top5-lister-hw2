import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS';
import ChangeItem_Transaction from './transactions/ChangeItem_Transaction';
import MoveItem_Transaction from './transactions/MoveItem_Transaction';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();
        this.tps = new jsTPS();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    checkToolbar = () => {
        let r_button = document.getElementById("redo-button");
        let u_button = document.getElementById("undo-button");
            
        if (!this.tps.hasTransactionToRedo()) {
            r_button.classList = "top5-button-disabled";
        }
        else {
            r_button.classList = "top5-button";
        }
        if (!this.tps.hasTransactionToUndo()) {
            u_button.classList = "top5-button-disabled";
        }
        else {
            u_button.classList = "top5-button";
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.loadList(newList);
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    renameItem = (name, indexVal) => {
        let currItems = this.state.currentList.items;
        currItems[indexVal] = name;

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    newMoveTrans = (origin, target) => {
        if (origin !== target){
            let queuedTrans = new MoveItem_Transaction(this, origin, target);
            this.tps.addTransaction(queuedTrans);
        }
        this.checkToolbar();
    }

    moveItem(origin, final) {
        let newList = this.state.currentList;
        newList.items.splice(final, 0, newList.items.splice(origin, 1)[0]);

        this.setState(prevState => ({
            currentList : newList,
            sessionData : prevState.sessionData
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    undoTrans = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.checkToolbar();
        }
    }
    redoTrans = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.checkToolbar();
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let close = document.getElementById("close-button")
        let add = document.getElementById("add-list-button");
        close.classList = "top5-button";
        add.classList = "top5-button-disabled";
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {

        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.tps.clearAllTransactions();
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
            let close = document.getElementById("close-button");
            let add = document.getElementById("add-list-button");
            close.classList = "top5-button-disabled";
            add.classList = "top5-button";
            this.checkToolbar();
        });
    }
    deleteList = (keyPair) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.setState((state) => ({
            currentList : this.state.currentList,
            sessionData : this.state.sessionData,
            listKeyPairMarkedForDeletion : keyPair
        }));
        // console.log(this.state.deletingListkeyPair);
        this.showDeleteListModal();
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    fullDelete = () => {
        let keyDel = this.state.listKeyPairMarkedForDeletion.key;
        let currData = this.state.sessionData;
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        let ind = 0;

        this.db.queryDeleteList(keyDel);

        for (let i = 0; i < newKeyNamePairs.length; i++) {
            if (newKeyNamePairs[i].key === keyDel) {
                ind = i;
            }
        }
        currData.keyNamePairs.splice(ind, 1);
        let currList = this.state.currentList;

        if (this.state.currentList != null){
            if (this.state.currentList.key === this.state.listKeyPairMarkedForDeletion.key) {
                currList = null;
            }
        }
        this.setState(prevState => ({
            currentList : currList,
            listKeyPairMarkedForDeletion : null,
            sessionData : currData
        }), () => {
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.hideDeleteListModal();
        });
    }
    keyboardInput = (event) => {
        if (event.ctrlKey && event.key === 'y') {
            this.redoTrans();
            this.checkToolbar();
        } else if (event.ctrlKey && event.key === 'z') {
            this.undoTrans();
            this.checkToolbar();
        }
    }
    render() {
        window.addEventListener("keydown", this.keyboardInput);
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList} 
                    undoCallback = {this.undoTrans}
                    redoCallback = {this.redoTrans}/>
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <Workspace
                    currentList={this.state.currentList}
                    renameItemCallback={this.renameItem}
                    moveItemCallback = {this.newMoveTrans} />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    listKeyPair = {this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    fullDelete = {this.fullDelete}
                />
            </div>
        );
    }
}

export default App;
