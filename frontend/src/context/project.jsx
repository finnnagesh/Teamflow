import React, { createContext, useContext, useState } from "react";

export const ProjectDataContext = createContext(new Map());

export const ProjectDataProvider = ({ children }) => {
  const [projectData, setProjectData] = useState({});
  return (
    <ProjectDataContext.Provider value={{projectData, setProjectData}}>
      {children}
    </ProjectDataContext.Provider>
  );
};
