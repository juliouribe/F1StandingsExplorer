# Generated by Django 4.1.7 on 2023-04-13 23:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_grandprix_raceresult'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='grandprix',
            options={'ordering': ('-race_date',)},
        ),
        migrations.AlterField(
            model_name='raceresult',
            name='fastest_lap',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='raceresult',
            name='finish',
            field=models.CharField(choices=[('1st', '1st'), ('2nd', '2nd'), ('3rd', '3rd'), ('4th', '4th'), ('5th', '5th'), ('6th', '6th'), ('7th', '7th'), ('8th', '8th'), ('9th', '9th'), ('9th', '9th'), ('10th', '10th'), ('11th', '11th'), ('12th', '12th'), ('13th', '13th'), ('14th', '14th'), ('15th', '15th'), ('16th', '16th'), ('17th', '17th'), ('18th', '18th'), ('19th', '19th'), ('20th', '20th')], max_length=4),
        ),
    ]
