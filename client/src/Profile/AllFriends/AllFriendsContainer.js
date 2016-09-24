import React, { PropTypes }  from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'
import * as userActions from '../../Redux/userReducer'


class AllFriendsContainer extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    console.log('i hit all friends container');
  }

  render() {
    return (
      <div>
        Hello World
      </div>
      )
  }
}


function mapStateToProps(state) {
  return {
    isLoggedIn: state.userReducer.isLoggedIn,
    user: state.userReducer.user
  }
}



export default connect(mapStateToProps)(AllFriendsContainer)

// export default AllFriendsContainer