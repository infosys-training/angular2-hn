import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useHackerNewsAPI';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './User.scss';

export default function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, error } = useUser(id!);

  const goBack = () => navigate(-1);

  return (
    <>
      {!user && !error && <Loader />}
      {!user && error && <ErrorMessage message={error} />}

      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={goBack}></span>
              Profile: {user.id}
            </p>
          </div>
          <div className="main-details">
            <span className="name">{user.id}</span>
            <span className="right">{user.karma} ★</span>
            <p className="age">Created {user.created}</p>
          </div>
          {user.about && (
            <div className="other-details">
              <p dangerouslySetInnerHTML={{ __html: user.about }} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
