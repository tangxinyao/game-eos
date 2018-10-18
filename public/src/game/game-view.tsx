import { inject, observer } from "mobx-react";
import moment from "moment";
import * as PIXI from "pixi.js";
import React from "react";
import Modal from "react-modal";

import { store } from "../index";
import { Store } from "../store";

import "./game.scss";

interface IGameViewProps {
  store ?: Store;
}

interface IGameViewState {
  isModalOpen: boolean;
}

@inject((stores) => {
  return stores;
})
@observer
export class GameView extends React.Component<IGameViewProps, IGameViewState> {
  private dom?: HTMLDivElement;
  constructor(props: any) {
    super(props);
    this.state = {
      isModalOpen: false,
    };
    this.ref = this.ref.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleList = this.handleList.bind(this);
    this.handleHideRecord = this.handleHideRecord.bind(this);
  }
  public componentDidMount() {
    if (this.props.store && this.dom) {
      this.props.store.initialGame(this.dom);
    }
  }
  public render() {
    return (
      <div className="container game" ref={this.ref}>
        <div className="header">
          <h1>2048</h1>
          <div className="score">
            <section>
              <div>ACCOUNT</div>
              <div>{this.props.store ? this.props.store.balance : 0}</div>
            </section>
            <section>
              <div>SCORE</div>
              <div>{this.props.store && this.props.store.getScore()}</div>
            </section>
            {/* <section>
              <div>BEST</div>
              <div>{this.props.store ? this.props.store.maxScore : 0}</div>
            </section> */}
          </div>
        </div>
        <div className="nav">
          <a onClick={this.handleList}>Rank List</a>
          <a onClick={this.handleStart}>Start</a>
          <a onClick={this.handleEnd}>End</a>
        </div>
        <Modal
          ariaHideApp={false}
          isOpen={this.state.isModalOpen}
          style={{
            content: {
              bottom: "auto",
              left: "50%",
              right: "auto",
              top: "50%",
              transform: "translate(-50%, -50%)",
            },
          }}>
          <div className="record-row record-header">
            <span>Rank</span>
            <span>User</span>
            <span>Score</span>
            <span>Time</span>
          </div>
          {
            this.props.store && this.props.store.records && this.props.store.records.map((record, index) => {
              return (
                <div key={record.id} className="record-row">
                  <span>{index + 1}</span>
                  <span>{record.user}</span>
                  <span>{record.score}</span>
                  <span>{moment(Number(record.updated_at) / 1000).format("MM-DD")}</span>
                </div>
              );
            })
          }
          <a className="record-button" onClick={this.handleHideRecord}>Return</a>
        </Modal>
      </div>
    );
  }
  private ref(dom: HTMLDivElement) {
    this.dom = dom;
  }
  private handleStart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.store) {
      this.props.store.startGame();
    }
  }
  private handleEnd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this.props.store) {
      this.props.store.endGame();
    }
  }
  private handleList(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isModalOpen: true });
  }
  private handleHideRecord(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ isModalOpen: false });
  }
}
