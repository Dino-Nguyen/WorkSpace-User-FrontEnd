import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import cardApi from '../../store/actions/api/card';
import classes from './AddCardForm.module.scss';

export default function AddCardForm({
  addCardFormVisibility,
  toggleAddCardForm,
  listId,
  list,
  setLists,
  setBoard,
}) {
  const [newCardTitle, setNewCardTitle] = useState('');
  const newCardInputRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    if (newCardInputRef && newCardInputRef.current) {
      newCardInputRef.current.focus();
    }
  }, [addCardFormVisibility]);

  const newCardTitleChangeHandler = (e) => setNewCardTitle(e.target.value);

  const addNewCardHandler = (e) => {
    e.preventDefault();
    if (!newCardTitle) {
      newCardInputRef.current.focus();
      toast.error('Please enter card title!', { theme: 'colored' });
      return;
    }

    const payload = {
      title: newCardTitle,
      boardId: id,
      listId,
    };

    const addCard = {
      _id: Math.floor(Math.random() * 18081998),
      title: newCardTitle,
      boardId: id,
      listId,
    };
    const newList = JSON.parse(JSON.stringify(list));
    newList.cards.push(addCard);
    newList.cardsOrder.push(addCard._id);
    let newLists = [];
    setLists((prev) => {
      newLists = [...prev];
      const index = newLists.findIndex((list) => list._id === newList._id);
      newLists[index] = newList;
      return newLists;
    });
    setBoard((prev) => {
      const newBoard = { ...prev };
      newBoard.lists = newLists;
      return newBoard;
    });
    setNewCardTitle('');
    toggleAddCardForm();

    cardApi.createCard(payload).then((data) => {
      toast.success(data.message, { theme: 'colored' });
    });
  };

  return (
    <form className={classes['add-card-form']} onSubmit={addNewCardHandler}>
      <input
        type="text"
        placeholder="Enter card title..."
        ref={newCardInputRef}
        onChange={newCardTitleChangeHandler}
        value={newCardTitle}
      />
      <div className={classes['btn-group']}>
        <button type="submit">OK</button>
        <button onClick={toggleAddCardForm} type="button">
          Cancel
        </button>
      </div>
    </form>
  );
}