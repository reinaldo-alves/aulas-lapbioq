import './App.css';
import { useEffect, useState } from 'react';
import Header from './Header';
import { authOnStateChanged, dbCollection, dbOnSnapshot, dbOrderBy } from './firebase';
import { IPost } from './types';
import Login from './Login';
import { User } from 'firebase/auth';
import Home from './Home';

function App() {

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState([] as Array<IPost>);

  useEffect(() => {
    authOnStateChanged((val) => {
      if(val !== null) {
        setUser(val)
      }
    })
    const dbQuery = dbOrderBy(dbCollection("posts"), 'timestamp', 'desc');
    const unsubscribe = dbOnSnapshot(dbQuery, (querySnapshot) => {
      const posts: IPost[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as IPost["info"]
        posts.push({ id: doc.id, info: data });
      });
      setPosts(posts);
    });
  }, [])

  return (
    <div className="App">
      {user?.displayName ?
        <>        
          <Header user={user} setUser={setUser}/>
          <div className="postsContainer">
            <Home />
          </div>
        </>
      :
        <Login user={user} setUser={setUser}/>
      }
    </div>
  );
}

export default App;