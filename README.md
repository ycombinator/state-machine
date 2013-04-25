# State machine as a service

Applications sometimes find themselves managing process flows. These process flows consist of states and inputs that move the process along from one state to another.

For instance, consider a user registration process. When the application creates a new user, that user may start off in a *UNVERIFIED* state. When the application verifies the user's email address, the user may move to a *VERIFIED* state. On the other hand, if sufficient time passes and the user is still in the *UNVERIFIED* state, the application may choose to move the user to a *EXPIRED* state.

Applications with such needs often end up implementing a state machine to manage the process flow. This service aims to save applications from that implementation effort.

Using this service such applications need only define the state machine that reflects the process flow and then tell the service each time a input is made to the process. The service will take care of properly transitioning to the next state in the flow and return that state to the application. The application may also, at any time, ask the service for the current state of a state machine it created.

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

#### State machine current state

##### Retrieve the current state the state machine is in

###### Request

    GET {baseuri}/v1/state-machine/2345/current-state

###### Response

    303 See Other
    Location: {baseuri}/v1/state-machine/2345/state/1


    200 OK

    {
      "links": {
        "self": "{baseuri}/v1/state-machine/2345/state/foo",
        "state-machine": "{baseuri}/v1/state-machine/2345"
      },
     "state": {
      "name": "foo"
     }
    }

#### State machine input

##### Inform the state machine of an input

###### Request

    POST {baseuri}/v1/state-machine/2345/input

    {
      "input": "2"
    }

###### Response (upon successful transition)

    303 See Other
    Location: {baseuri}/v1/state-machine/2345/state/3


    200 OK

    {
      "links": {
        "self": "{baseuri}/v1/state-machine/2345/state/baz",
        "state-machine": "{baseuri}/v1/state-machine/2345"
      },
     "state": {
      "name": "baz"
     }
    }

