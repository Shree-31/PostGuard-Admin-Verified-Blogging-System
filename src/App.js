import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menubar from "./Menubar";
import Login from "./Login";
import Blog from "./Blog";
import Post from "./Post"
import Category from "./Category";
import AddPost from "./AddPost";
import "./App.css";



const App = () => {
  return (
    <Router>
      <div className="d-flex  ms-250px" >
       
        <div className="flex-grow-1 ">
          <Routes>
          <Route path="/" element={<Login />} />
          <Route path ="/dashboard" element={
            <div className = "d-flex">
              <Menubar />
              <div className="flex-grow-1 p-4">
                <Blog />
              </div>
            </div>
          }/> 

<Route path ="/category" element={
            <div className = "d-flex">
              <Menubar />
              <div className="flex-grow-1 p-4">
                <Category />
              </div>
            </div>
          }/> 

<Route path ="/addpost" element={
            <div className = "d-flex">
              <Menubar />
              <div className="flex-grow-1 p-4">
                <AddPost />
              </div>
            </div>
          }/> 
            
            <Route path="/menubar" element={<Menubar />} />
            <Route path ="/post" element={
            <div className = "d-flex">
              <Menubar />
              <div className="flex-grow-1 p-4">
                <Post />
              </div>
            </div>
          }/> 
          
            <Route path="/addpost" element= {<AddPost />}/>
            <Route path="/category" element= {<Category />}/>
            <Route path="/categories" element={<h2>Categories</h2>} />
            <Route path="/users" element={<h2>Users</h2>} />
            <Route path="/settings" element={<h2>Settings</h2>} />
            
            
            
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;