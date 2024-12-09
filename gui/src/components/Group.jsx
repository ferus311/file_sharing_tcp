const Group = ({ groupId ,groupName }) => {
    const getRandomImage = () => {
        const randomNumber = Math.floor(Math.random() * 5) + 1;
        return `assets/img/news/0${randomNumber}.jpg`;
    };

    return (
        <div className="news-card-items mt-0 box-shadow">
            <div className="news-image">
                <img src={getRandomImage()} alt="news-img" />
            </div>
            <div className="news-content">
                <div className="post-list">
                    <span>Group {groupId}</span>
                    <p>DEC 24, 2024</p>
                </div>
                <h3>
                    <a href="news-details.html">{groupName}</a>
                </h3>
                {/* <div className="author-items">
                    <div className="author-image">
                        <div className="author-img bg-cover"
                            style={{ backgroundImage: "url('assets/img/avatar/image.png')" }}></div>
                        <div className="content">
                            <h6>Admin</h6>
                            <p>Co, Founder</p>
                        </div>
                    </div>
                    <a href="news-details.html" className="link-btn">
                        <i className="fa-solid fa-arrow-right"></i>
                    </a>
                </div> */}
            </div>
        </div>
    )
}

export default Group;
