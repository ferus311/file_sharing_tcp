import { useTranslation } from 'react-i18next';

const Group = ({ groupId, groupName }) => {
    const { t } = useTranslation();

    const getRandomImage = () => {
        const randomNumber = Math.floor(Math.random() * 5) + 1;
        return `/assets/img/news/0${randomNumber}.jpg`;
    };

    return (
        <div className="news-card-items mt-0 box-shadow">
            <div className="news-image">
                <img src={getRandomImage()} alt="news-img" />
            </div>
            <div className="news-content">
                <div className="post-list">
                    <span>{t('group')} {groupId}</span>
                    {/* <p>{t('date_example')}</p> */}
                </div>
                <h3>
                    <a href="news-details.html">{groupName}</a>
                </h3>
            </div>
        </div>
    )
}

export default Group;
