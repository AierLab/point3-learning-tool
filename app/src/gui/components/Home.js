/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import '../assets/Home.css';
import {
  BsFillPlayCircleFill,
  BsSkipForward,
  BsSkipBackward,
  BsMicFill,
} from 'react-icons/bs';

import HomeTable from './HomeTable';
import HomeNavigation from './HomeNavigation';
import HomeList from './HomeList';
import Cosine from './Cosine';

export default function Home() {
  return (
    <div className="home-body">
      <div className="top-container">
        <div className="top-left">
          Window Name
        </div>
        <div className="top-right">
          Menu
        </div>
      </div>

      <div className="mid-container">
        <div className="item-list">
          <HomeList />
        </div>

        <div className="audio-body">

          <Cosine />

          <div className="audio-button-container">
            <div className="audio-button-mid">
              <BsSkipBackward size={38} />
              <BsFillPlayCircleFill size={38} />
              <BsSkipForward size={38} />
            </div>
            <div className="audio-mic">
              <BsMicFill size={38} />
            </div>
          </div>
        </div>

        <div className="mid-right">
          <HomeTable />
        </div>
      </div>

      <div className="bottom-container">
        <HomeNavigation />
      </div>

    </div>
  );
}
