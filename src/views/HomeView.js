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
  render() {
    return (
      <div className="container text-center">
        <h2>react redux minimal starter</h2>
        <h4>sample counter: {this.props.counter}</h4>
        <button
          className="btn btn-default"
          onClick={this.props.actions.increment}
        >
          increment
        </button>
        <hr />
        <Link to="/about">about view</Link>
      </div>
    )
  }
}

HomeView.propTypes = {
  actions: React.PropTypes.object,
  counter: React.PropTypes.number
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeView)
