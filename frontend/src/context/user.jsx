import React, { createContext, useContext ,useState} from "react";

export const UserDataContext = createContext(new Map());

export const UserDataProvider = ({ children }) => {
    const [userdata, setuserdata] = useState(null);

  return (
    <UserDataContext.Provider value={{userdata, setuserdata}}>
      {children}
    </UserDataContext.Provider>
  );
};


