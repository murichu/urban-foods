/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
import React from 'react'
import './AppDownload.css'
import { assets } from "../../assets/assets";


const AppDownload = () => {
  return (
    <div className='app-download' id="app-download">
      <p>For Better Experience Download<br />Urban Foods App</p>
      <div className='app-download-platforms'>
        <img className='play-store' src={assets.play_store} alt="" />
        <img className='app-store' src={assets.app_store} alt="" />
      </div>
    </div>
  )
}

export default AppDownload
