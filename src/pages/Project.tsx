import React from "react";
import { useParams } from "react-router-dom";

const Project = () => {
  const { id } = useParams();
  return <h1>Project Page - Project ID: {id}</h1>;
};

export default Project;
