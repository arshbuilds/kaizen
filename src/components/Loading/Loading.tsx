import React from "react";
import styles from "./Loading.module.css";

const Loading = () => {
  return (
    <div className="min-h-screen flex justify-center items-center p-4 mx-auto pb-24">
        <div className={styles.loader}></div>
    </div>
  );
};

export default Loading;
