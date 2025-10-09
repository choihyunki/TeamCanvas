import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Main: React.FC = () => {
  return (
    <div>
      <Header onMenuClick={() => console.log("Menu clicked")} />
      <Footer />
    </div>
  );
};
export default Main;
