import React, {PropTypes} from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'
import Search from './Search.js'
import * as userActions from '../Redux/userReducer'


class SearchContainer extends React.Component {
	constructor(props) {
		super(props)
	}

  componentWillMount() {
    //console.log('making sure my search container is getting props', this.props.search);
  }

  addFriend(friend) {
    console.log('i tried to add this friend', friend);
    console.log('im checking my own user info', this.props.user);



    let myHeaders = new Headers({'Content-Type': 'application/graphql; charset=utf-8'});
    let options = {

      method: 'POST',
      headers: myHeaders,
      body: `mutation
        {
          addFriendship(userOne: \"${this.props.user.username}\" userTwo: \"${friend.username}\")
          {
                userOne
                userTwo
                relationship
                chatCount
              }
        }`



    };
    fetch('/graphql', options).then((res) =>{
      return res.json().then((data) => {
        console.log('what is my data',data);
        // this.props.dispatch(userActions.userAuth(data));
        // console.log('checking router', this.context.router);
        // this.context.router.push('/profile')
        })
    })



  }

	render() {
		return (
			<div>
      {this.props.search.map((item, index) => <Search key={index} friend={item} addFriend={this.addFriend.bind(this)}/>)}
			</div>
			)
	}
}


function mapStateToProps(state) {
  return {
    user: state.userReducer.user,
    search: state.userReducer.search
  }
}

SearchContainer.contextTypes = {
  router: PropTypes.object.isRequired
}


export default connect(mapStateToProps)(SearchContainer)