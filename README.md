# State machine as a service

Applications sometimes find themselves managing a process flow comprising of many process states and decisions that move the process along from one state to another. For example, consider a user registration process. When the application creates a new user, that user may start off in a *UNVERIFIED* state. When the application verifies the user's email address, the user may move to a *VERIFIED* state. On the other hand, if sufficient time passes and the user is still in the *UNVERIFIED* state, the application may choose to move the user to a *EXPIRED* state.

Applications with such needs will end up implementing a state machine to manage the process flow. This service aims to save applications from that implementation effort. Using this service your application need only define the state machine that reflects the process flow and then tell the service each time a decision is made in the process. The service will take care of transitioning to the next state in the flow. Furthermore, the application can store arbitraty data along with each state.

# Usage
The service is currently provided as a REST API. 

## REST API

### Resources

#### State Machines

##### Create a new state machine

###### Request

    POST {baseuri}/v1/state-machines

    {
      "initialState": "foo",
      "states": {
        "foo": {
          "transitions": [
            { "input": "/1/","nextState": "bar" },
            { "input": "/2/","nextState": "baz" }
          ]
        },
        "bar": {
          "transitions": []
        },
        "baz": {}
      }
    }

###### Response (upon successful creation)

    201 Created
    Location: {baseuri}/v1/state-machine/2345

    {
      "links": {
        "self": "{baseuri}/v1/state-machine/2345"
      }
    }
