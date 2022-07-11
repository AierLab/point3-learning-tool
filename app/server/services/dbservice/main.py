# This is a sample Python script.
import os
import time
from datetime import datetime
from originClass import store_json_file, create_new_json_file, delete_file_according_to_id_origin, \
    delete_file_according_to_file_name_origin, find_file_according_to_id_origin, find_file_according_to_title_origin, \
    change_file_title_time_origin, create_new_file_in_origin, change_file_title_time_origin_id

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.
from selfClass import create_new_file_in_self, find_file_according_to_id_self, find_file_according_to_title_self, \
    change_file_title_time_self, delete_file_according_to_id_self, delete_file_according_to_file_name_self, \
    change_file_title_time_self_id


def print_hi(name):
    # Use a breakpoint in the code line below to debug your script.

    print(f'Hi, {name}'+' ')  # Press Ctrl+F8 to toggle the breakpoint.

    #test1
    # id = "sl0tMili"
    # title = "slot"
    # audio_file_dir_temp = "slot.mp3"
    # level = 2
    # typess = "origin"
    # now = datetime.now()
    # current_time = now.strftime("%Y-%m-%d %H:%M:%S")
    #
    #
    # create_new_file_in_origin(
    #     id,title,audio_file_dir_temp,level,typess,current_time
    # )

    # id = "id761551"
    # title = "myrecord1"
    # audio_file_dir_temp = "myrecord1.mp3"
    # level = 2
    # typess = "self"
    # now = datetime.now()
    # current_time = now.strftime("%Y-%m-%d %H:%M:%S")
    #
    # create_new_file_in_self(
    #     id, title, audio_file_dir_temp, level, typess, current_time
    # )




    # first_file = find_file_according_to_id_origin("sl0tMili").create_dict_origin()
    #
    # second_file = find_file_according_to_title_origin("slot").create_dict_origin()
    #
    # third_file = find_file_according_to_id_self("id761551").create_dict_origin()
    #
    # fourth_file = find_file_according_to_title_self("myrecord1").create_dict_origin()

    # print(first_file)
    #
    # print(second_file)
    #
    # print(third_file)
    #
    # print(fourth_file)

    now = datetime.now()
    current_time = now.strftime("%Y-%m-%d %H:%M:%S")
    # change_file_title_time_self("myrecord1", "newrecord1", current_time)
    change_file_title_time_origin_id("sl0tMili", "sl0t", current_time)
    # delete_file_according_to_id_origin("sl0tMili")

    # delete_file_according_to_file_name_self("myrecord1")



# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    print_hi('PyCharm')

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
