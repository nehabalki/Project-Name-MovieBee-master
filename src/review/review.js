import React from 'react';
import './review.css';
import firebase, { auth, provider } from '../header/firebase';
import StarRatingComponent from 'react-star-rating-component';

export class Review extends React.Component {

  constructor() {
  super();
  this.state = {
    rating: 5,
    currentItem: '',
    username: '',
    items: [],
    user: null,
    moviename: ''
  }
  this.handleChange = this.handleChange.bind(this);
  this.handleSubmit = this.handleSubmit.bind(this);
  }

  onStarClick(nextValue, prevValue, name) {
    this.setState({rating: nextValue});
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const itemsRef = firebase.database().ref('items');
    const item = {
      review: this.state.currentItem,
      user: this.state.user.displayName || this.state.user.email,
      moviename: this.props.moviename,
      rating: this.state.rating
    }
    itemsRef.push(item);
    this.setState({
      currentItem: '',
      username: '',
      moviename: '',
      rating: 5
    });
  }

  componentDidMount() {
      auth.onAuthStateChanged((user) => {
        if (user) {
          this.setState({ user });
        }
      });
      const itemsRef = firebase.database().ref('items');
      itemsRef.on('value', (snapshot) => {
        let items = snapshot.val();
        let newState = [];
        for (let item in items) {
          newState.push({
            id: item,
            review: items[item].review,
            user: items[item].user,
            moviename: items[item].moviename,
            rating: items[item].rating
          });
        }
        this.setState({
          items: newState
        });
      });
    }

  removeItem(itemId) {
     const itemRef = firebase.database().ref(`/items/${itemId}`);
     itemRef.remove();
  }

  render() {
    const link = 'https://image.tmdb.org/t/p/w300';
    const { rating } = this.state;

    return(
      <div>
        <div className="figureContainer">
          <section className='add-item'>
              <form onSubmit={this.handleSubmit}>
                <div style={{textAlign:"left", fontWeight: "bold"}} >
                <span>Write a review</span>
                </div>&nbsp;&nbsp;
                <input type="text" name="username" placeholder="Username" onChange={this.handleChange} value={this.state.username} />
                <input type="text" name="currentItem" placeholder="Movie review" onChange={this.handleChange} value={this.state.currentItem} />
                <div style={{textAlign:"left", fontWeight: "bold"}} >
                <span>Rating:&nbsp;&nbsp;
                <StarRatingComponent
                name="rate1"
                starCount={10}
                value={this.state.rating}
                onStarClick={this.onStarClick.bind(this)}/></span>
                </div>
                <button id="button1">Add Review</button>
              </form>
          </section>
          <section className='display-item'>
            <div className="wrapper">
              <ul>
              {this.state.items.map((item) => {
              return (
                <div>
                 <li key={item.id}>
                 {item.moviename === this.props.moviename ? (
                   <ul id="reviewview">
                   <li id=""><small>User Review:&nbsp;&nbsp;</small><StarRatingComponent
                   name="rate1"
                   starCount={10}
                   value={item.rating}/></li>
                   <li id="horizontal"> <small>{item.review}</small></li>
                   <li id="span2"> <button id="removebutton" onClick={() => this.removeItem(item.id)}>Delete Review</button></li>
                   <li id="span2"><small>Reviewed By: {item.user}&nbsp;&nbsp;</small></li>
                   </ul>) : null }
                 </li>
                   </div>
                  )
              })}
              </ul>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
