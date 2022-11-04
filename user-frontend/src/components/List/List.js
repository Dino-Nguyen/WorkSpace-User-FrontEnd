import { useState } from 'react';
import ReactDOM from 'react-dom';
import classes from './List.module.scss';
import clsx from 'clsx';
import mapOrder from '../../utils/map-order';
import Card from '../Card/Card';
import { Container, Draggable } from 'react-smooth-dnd';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import AddCardForm from '../AddCardForm/AddCardForm';
import listApi from '../../store/actions/api/list';
import {
  selectTextHandler,
  saveContentAfterPressEnter,
} from '../../utils/content-editable';
import { toast } from 'react-toastify';

export default function List({ list, listId, onCardDrop, setLists, setBoard }) {
  const cards = mapOrder(list.cards, list.cardsOrder, '_id');
  const [modalVisibility, setModalVisibility] = useState(false);
  const [addCardFormVisibility, setAddCardFormVisibility] = useState(false);

  let prevListTitle = list.title;
  const [listTitle, setListTitle] = useState(prevListTitle);

  const listTitleChangeHandler = (e) => {
    setListTitle(e.target.value);
  };

  const listTitleBlurHandler = () => {
    if (listTitle === prevListTitle) return;
    const payload = { title: listTitle };
    listApi.updateList(listId, payload).then((data) => {
      toast.success(data.message, { theme: 'colored' });
    });
  };

  const deleteListHandler = () => {
    listApi.deleteList(listId).then((data) => {
      toast.success(data.message, { theme: 'colored' });
      let newLists = [];
      setLists((prev) => {
        newLists = [...prev].filter((list) => list._id !== listId);
        return newLists;
      });
      setBoard((prev) => {
        const index = [...prev.listsOrder].indexOf(listId);
        const newListsOrder = [...prev.listsOrder].splice(index, 1);

        return {
          ...prev,
          lists: newLists,
          listsOrder: newListsOrder,
        };
      });
    });
  };

  const toggleModal = () => setModalVisibility(!modalVisibility);

  const toggleAddCardForm = () =>
    setAddCardFormVisibility(!addCardFormVisibility);

  const listHeaderClassName = clsx(
    'column-drag-handle',
    classes['list--header'],
  );

  return (
    <>
      <article className={classes['list']}>
        <div className={listHeaderClassName}>
          <input
            type="text"
            spellCheck="false"
            onClick={selectTextHandler}
            onChange={listTitleChangeHandler}
            onBlur={listTitleBlurHandler}
            onKeyDown={saveContentAfterPressEnter}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            value={listTitle}
            className={classes['editable-title']}
          />
          <div className={classes['btn-group']}>
            <button onClick={toggleModal}>
              <svg
                width="18"
                height="4"
                viewBox="0 0 18 4"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M9 0C8.60444 0 8.21776 0.117298 7.88886 0.337061C7.55996 0.556824 7.30362 0.869181 7.15224 1.23463C7.00087 1.60009 6.96126 2.00222 7.03843 2.39018C7.1156 2.77814 7.30608 3.13451 7.58579 3.41421C7.86549 3.69392 8.22186 3.8844 8.60982 3.96157C8.99778 4.03874 9.39992 3.99913 9.76537 3.84776C10.1308 3.69638 10.4432 3.44004 10.6629 3.11114C10.8827 2.78224 11 2.39556 11 2C11 1.46957 10.7893 0.96086 10.4142 0.585787C10.0391 0.210714 9.53043 0 9 0ZM2 0C1.60444 0 1.21776 0.117298 0.88886 0.337061C0.559962 0.556824 0.303617 0.869181 0.152242 1.23463C0.000866562 1.60009 -0.0387401 2.00222 0.0384303 2.39018C0.115601 2.77814 0.306082 3.13451 0.585787 3.41421C0.865492 3.69392 1.22186 3.8844 1.60982 3.96157C1.99778 4.03874 2.39992 3.99913 2.76537 3.84776C3.13082 3.69638 3.44318 3.44004 3.66294 3.11114C3.8827 2.78224 4 2.39556 4 2C4 1.46957 3.78929 0.96086 3.41421 0.585787C3.03914 0.210714 2.53043 0 2 0ZM16 0C15.6044 0 15.2178 0.117298 14.8889 0.337061C14.56 0.556824 14.3036 0.869181 14.1522 1.23463C14.0009 1.60009 13.9613 2.00222 14.0384 2.39018C14.1156 2.77814 14.3061 3.13451 14.5858 3.41421C14.8655 3.69392 15.2219 3.8844 15.6098 3.96157C15.9978 4.03874 16.3999 3.99913 16.7654 3.84776C17.1308 3.69638 17.4432 3.44004 17.6629 3.11114C17.8827 2.78224 18 2.39556 18 2C18 1.46957 17.7893 0.96086 17.4142 0.585787C17.0391 0.210714 16.5304 0 16 0Z" />
              </svg>
            </button>
            <button onClick={toggleAddCardForm}>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <rect x="4" width="2" height="10" />
                <rect y="6" width="2" height="10" transform="rotate(-90 0 6)" />
              </svg>
            </button>
          </div>
        </div>
        <div className={classes['list--body']}>
          {addCardFormVisibility && (
            <AddCardForm
              addCardFormVisibility={addCardFormVisibility}
              toggleAddCardForm={toggleAddCardForm}
              listId={listId}
              list={list}
              setLists={setLists}
              setBoard={setBoard}
            />
          )}
          <Container
            groupName="list"
            orientation="vertical"
            onDrop={(dropResult) => onCardDrop(list._id, dropResult)}
            getChildPayload={(index) => cards[index]}
            dragClass={classes['card-ghost']}
            dropClass={classes['card-ghost-drop']}
            dropPlaceholder={{
              animationDuration: 150,
              showOnTop: true,
              className: classes['card-drop-preview'],
            }}
            dropPlaceholderAnimationDuration={200}>
            {cards &&
              cards.map((card) => (
                <Draggable key={card._id}>
                  <Card card={card} />
                </Draggable>
              ))}
          </Container>
        </div>
      </article>
      {ReactDOM.createPortal(
        <ConfirmModal
          modalVisibility={modalVisibility}
          toggleModal={toggleModal}
          title="Delete List"
          content={`Are you sure want to delete <strong>${list.title}</strong> ? </br> (All related cards will also be deleted)`}
          deleteListHandler={deleteListHandler}
        />,
        document.getElementById('modal-root'),
      )}
    </>
  );
}
