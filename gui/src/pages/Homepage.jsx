import { useNavigate, Link } from "react-router-dom";
import Group from "../components/Group";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const Homepage = () => {

    const { token } = useAuth();
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate();



    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await window.electronAPI.listGroups(token);
                if (response.startsWith('2000')) {
                    const data = response.slice(5); // Loại bỏ mã 2000 và khoảng trắng
                    const groupArray = data
                        .split('||') // Tách các nhóm bằng "||"
                        .map((item) => {
                            const [id, name] = item.split('&'); // Tách ID và tên nhóm bằng "&"
                            return { id: parseInt(id, 10), name };
                        });
                    setGroups(groupArray);
                } else {
                    console.error('Failed to fetch groups:', response);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };

        fetchGroups();
    }, [token]);


    return (
        <div>
            <div class="breadcrumb-wrapper bg-cover" style={{ backgroundImage: "url('assets/img/breadcrumb-1.jpg')" }}>
                <div class="container">
                    <div class="page-heading">
                        <div class="page-header-left">
                            <h1 class="wow fadeInUp" data-wow-delay=".3s">Let's share together!</h1>
                        </div>
                        <div class="breadcrumb-image wow fadeInUp" data-wow-delay=".4s">
                            <img src="assets/img/breadcrumb.png" alt="img" />
                        </div>
                    </div>
                </div>
            </div>

            <section class="news-section fix section-padding">
                <div class="container">
                    <div class="row g-4">
                        {groups.map((group, index) => (
                            <div class="col-xl-4 col-lg-6 col-md-6 wow fadeInUp" data-wow-delay={`${0.3 + index * 0.2}s`} key={index}>
                                <Group groupId={group.id} groupName={group.name} />
                            </div>
                        ))}
                    </div>
                    <div class="page-nav-wrap pt-5 text-center wow fadeInUp" data-wow-delay=".3s">
                        <ul>
                            <li><a class="page-numbers icon" href="news-grid.html#"><i
                                class="fa-solid fa-arrow-left-long"></i></a></li>
                            <li><a class="page-numbers" href="news-grid.html#">01</a></li>
                            <li><a class="page-numbers" href="news-grid.html#">02</a></li>
                            <li><a class="page-numbers" href="news-grid.html#">03</a></li>
                            <li><a class="page-numbers icon" href="news-grid.html#"><i
                                class="fa-solid fa-arrow-right-long"></i></a></li>
                        </ul>
                    </div>
                </div>
            </section>


        </div>
    )
}

export default Homepage;
