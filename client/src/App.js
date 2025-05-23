import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import Calendar from 'react-calendar';
import "./App.css";

const images = [
  { img: "https://assets.atdw-online.com.au/images/9e612a3d635dd644f4fc4f9e236caec2.jpeg?rect=400%2C0%2C2400%2C1800&w=2048&h=1536&rot=360" },
  { img: "https://res.cloudinary.com/cityofsydney/image/upload/f_auto/c_fill,h_960,w_2560/v1735344538/k7h9gk6i1z6d/rjKnZGeH8GcwFYtMMYXeO/a7293030-c4af-11ef-93b3-dd93c571ed88--XSWL--xi-o-s--w-le--hero.jpg" },
  { img: "https://res.cloudinary.com/cityofsydney/image/upload/f_auto/c_fill,h_960,w_2560/v1741837364/k7h9gk6i1z6d/1iuYy9FQja1imbJVkv4eWj/31528c50-ffbd-11ef-9088-ff19286913fd--Bloom-hero.jpg" },
  { img: "https://res.cloudinary.com/cityofsydney/image/upload/f_auto/c_fill,h_712,w_712/v1745801826/k7h9gk6i1z6d/jD32uzrlO4BjZqyapqnME/96899e61-23cb-11f0-a26f-49d262e7118c--Damulay-Ngurang-Mother-s-Day-tile.jpg" },
  { img: "https://res.cloudinary.com/cityofsydney/image/upload/f_auto/c_fill,h_960,w_1200/v1715129059/k7h9gk6i1z6d/jD32uzrlO4BjZqyapqnME/8a419000-0cd3-11ef-afc4-fd383fd380b4--Damulay-Ngurang-Mothers-Day-Barangaroo004--1-.jpg" },
  { img: "https://assets.atdw-online.com.au/images/997367b1829c1faaca6cb1e5bc35fea9.jpeg?rect=195%2C0%2C3111%2C2333&w=1600&h=1200&&rot=360" },
  { img: "https://www.sydney.com/sites/sydney/files/styles/landscape_1200x675/public/2024-08/203836_Vivid_Sydney_2024_DNSW_DT.webp?h=f0fb51a5&itok=o2IECLOw" },
];

const App = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("https://scraper-vlp1.onrender.com/api/events");
        setEvents(res.data.events);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h1 className="heading">Must-see Events</h1>
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search"
      />

      <div className="grid">
        {filteredEvents.map((event, index) => (
          <div className="card" key={index}>
            <img className="card-img" src={images[index % images.length].img} alt={event.title} />

            <div className="card-body">
              <h2 className="title">{event.title}</h2>
              <p className="category">{event.category}</p>
              <div className="info">
                <span className="icon-text">
                  <FaMapMarkerAlt className="icon" /> {event.location}
                </span>
                <span className="icon-text">
                  <FaCalendarAlt className="icon" /> {event.time}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowModal(true);
                  setEmail("");
                  setOtp("");
                  setEmailSubmitted(false);
                }}
                className="ticket-button"
              >
                GET TICKETS
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            {!emailSubmitted ? (
              <>
                <h2>Enter your email to get tickets</h2>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  onClick={async () => {
                    if (/\S+@\S+\.\S+/.test(email)) {
                      try {
                        const res = await fetch("https://scraper-vlp1.onrender.com/otproutes/send", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ email }),
                        });

                        const data = await res.json();
                        if (res.ok) {
                          alert("OTP sent to your email.");
                          setEmailSubmitted(true);
                        } else {
                          alert(data.error || "Failed to send OTP.");
                        }
                      } catch (err) {
                        console.error("Error sending OTP:", err);
                        alert("Network error. Please try again.");
                      }
                    } else {
                      alert("Please enter a valid email.");
                    }
                  }}
                >
                  Submit Email
                </button>

                <Calendar onChange={setSelectedDate} value={selectedDate} />
                <p>Selected Date: {selectedDate.toDateString()}</p>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </>
            ) : (
              <>
                <h2>Enter OTP sent to {email}</h2>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  onClick={async () => {
                    if (otp.trim() !== "") {
                      try {
                        const res = await fetch("https://scraper-vlp1.onrender.com/otproutes/verify", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ email, otp }),
                        });

                        const data = await res.json();
                        if (res.ok) {
                          alert("OTP verified! Redirecting...");
                          window.location.href = "https://whatson.cityofsydney.nsw.gov.au/";
                        } else {
                          alert(data.error || "Invalid OTP.");
                        }
                      } catch (err) {
                        console.error("Error verifying OTP:", err);
                        alert("Network error. Please try again.");
                      }
                    } else {
                      alert("Please enter the OTP.");
                    }
                  }}
                >
                  Verify OTP
                </button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
