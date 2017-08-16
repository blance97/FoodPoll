import React, { Component } from 'react';
import { List, Image, Card, Divider, Dimmer, Loader, Segment, Modal, Button, Icon, Header } from 'semantic-ui-react';
import axios from 'axios';
import DetailedPlace from './DetailedPlace';

export default class SuggestedPlaces extends Component {
    constructor(props) {
        super(props);
        console.log(this.props)
        this.state = {
            SuggestedPlaces: {},
            initPos: {},
            loading: true,
            modalOpen: false,
        }
        this.handleClose = this.handleClose.bind(this);
    }
    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
                this.props.keywords.forEach((element) => {
                    console.log("eleement: ", element.data);
                    axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?opennow&location=${position.coords.latitude},${position.coords.longitude}&radius=24141&type=restaurant&keyword=${element.data}&key=AIzaSyCpOKNd2Ik3OgRAryOqTXvK8dpi9m76PdE`)
                        .then((res) => this.setState({ loading: false, initPos: { lat: position.coords.latitude, long: position.coords.longitude }, SuggestedPlaces: { ...this.state.SuggestedPlaces, [element.data]: res.data.results.slice(0, 10) } }));
                })
            });
        (error) => alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    }

    renderPrice(price_level) {
        if (price_level) {
            let i = 0;
            let builder = "";
            while (i < price_level) {
                builder += "$"
                i++;
            }
            return builder;
        }
        return "Unknown $";
    }
    getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
        var R = 3959; // Radius of the earth in m
        var dLat = this.deg2rad(lat2 - lat1);  // this.deg2rad below
        var dLon = this.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in m
        return d.toFixed(2);
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180)
    }
    handleOpen(id, dist) {
        this.setState({
            modalOpen: true,
            detailedID: id,
            distance: dist
        })
    }

    handleClose() {
        this.setState({
            modalOpen: false,
        })
    }
    render() {
        console.log(this.state);
        const places = Object.keys(this.state.SuggestedPlaces).map((element, i) => {
            return (
                <Card raised color={"orange"} key={i}>
                    <Card.Header>
                        <center><h1>{element}</h1></center>
                    </Card.Header>
                    <List style={{ height: '300px', overflowY: 'scroll' }}>
                        {this.state.SuggestedPlaces[element].map((item, j) => {
                            let dist = this.getDistanceFromLatLonInMiles(this.state.initPos.lat, this.state.initPos.long, item.geometry.location.lat, item.geometry.location.lng)
                            let priceLvl = this.renderPrice(item.price_level);
                            return (
                                <List.Item key={j}>
                                    <Image avatar src={item.icon} />
                                    <List.Content>
                                        <List.Header onClick={() => this.handleOpen(item.place_id, dist)} as='a'>{`${item.name}(${priceLvl})`}</List.Header>
                                        <List.Description>{`${item.vicinity}`}</List.Description>
                                        <List.Description>{`Rating: ${item.rating} | ${dist} mi`}</List.Description>
                                    </List.Content>
                                    <Divider fitted />
                                </List.Item>
                            )
                        })
                        }
                    </List>
                </Card>
            )

        })
        return (
            <div>
                {this.state.loading === true ? <Segment>
                    <Dimmer active>
                        <Loader />
                    </Dimmer>
                </Segment> :
                    <Card.Group itemsPerRow={2}>
                        {places}
                    </Card.Group >}
                <Modal
                    open={this.state.modalOpen}
                    onClose={this.handleClose}
                    size='small'
                >
                    <Modal.Content>
                        <DetailedPlace detailedID={this.state.detailedID} dist={this.state.distance} />
                    </Modal.Content>
                </Modal>
            </div>
        )
    }
}
