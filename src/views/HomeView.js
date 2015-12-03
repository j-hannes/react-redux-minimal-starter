import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import counterActions from 'actions/counter'
import { Link } from 'react-router'

const mapStateToProps = (state) => ({
  counter: state.counter,
  routerState: state.router
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(counterActions, dispatch)
})

export class HomeView extends React.Component {
  render () {
    return (
      <div className='container text-center'>
        <h1>Welcome to the React Redux Starter Kit</h1>
        <h2>Sample Counter: {this.props.counter}</h2>
        <button className='btn btn-default'
                onClick={this.props.actions.increment}>
          Increment
        </button>
        <hr />
        <Link to='/about'>Go To About View</Link>
      </div>
    )
  }
}

HomeView.propTypes = {
  actions: React.PropTypes.object,
  counter: React.PropTypes.number
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeView)
